from sqlalchemy.orm import Session
from sqlalchemy import func

from db.models import (
    Category,
    Product,
    InventoryTransaction,
    StockAlert
)

from db.schemas import (
    CategoryCreate,
    CategoryUpdate,
    ProductCreate,
    ProductUpdate
)


class InventoryService:

    # ==========================================================
    # CATEGORY OPERATIONS
    # ==========================================================

    @staticmethod
    def create_category(
        db: Session,
        payload: CategoryCreate
    ):

        existing = (
            db.query(Category)
            .filter(
                func.lower(Category.category_name)
                == payload.category_name.lower()
            )
            .first()
        )

        if existing:
            raise ValueError(
                "Category already exists."
            )

        category = Category(
            category_name=payload.category_name.strip(),
            description=payload.description
        )

        db.add(category)
        db.commit()
        db.refresh(category)

        return category

    @staticmethod
    def get_all_categories(
        db: Session
    ):

        return (
            db.query(Category)
            .order_by(Category.category_name.asc())
            .all()
        )

    @staticmethod
    def get_category_by_id(
        db: Session,
        category_id: int
    ):

        category = (
            db.query(Category)
            .filter(Category.id == category_id)
            .first()
        )

        if not category:
            raise ValueError(
                "Category not found."
            )

        return category

    @staticmethod
    def update_category(
        db: Session,
        category_id: int,
        payload: CategoryUpdate
    ):

        category = (
            InventoryService.get_category_by_id(
                db,
                category_id
            )
        )

        updates = payload.model_dump(
            exclude_unset=True
        )

        for key, value in updates.items():
            setattr(category, key, value)

        db.commit()
        db.refresh(category)

        return category

    @staticmethod
    def delete_category(
        db: Session,
        category_id: int
    ):

        category = (
            InventoryService.get_category_by_id(
                db,
                category_id
            )
        )

        products = (
            db.query(Product)
            .filter(
                Product.category_id == category.id
            )
            .count()
        )

        if products > 0:
            raise ValueError(
                "Cannot delete category with products."
            )

        db.delete(category)

        db.commit()

        return True

    # ==========================================================
    # PRODUCT OPERATIONS
    # ==========================================================

    @staticmethod
    def create_product(
        db: Session,
        payload: ProductCreate
    ):

        category = (
            db.query(Category)
            .filter(
                Category.id == payload.category_id
            )
            .first()
        )

        if not category:
            raise ValueError(
                "Category not found."
            )

        if payload.sku:

            existing_sku = (
                db.query(Product)
                .filter(
                    Product.sku == payload.sku
                )
                .first()
            )

            if existing_sku:
                raise ValueError(
                    "SKU already exists."
                )

        product = Product(
            category_id=payload.category_id,
            product_name=payload.product_name,
            sku=payload.sku,
            selling_price=payload.selling_price,
            cost_price=payload.cost_price,
            reorder_level=payload.reorder_level,
            current_stock=payload.current_stock
        )

        db.add(product)
        db.commit()
        db.refresh(product)

        InventoryService._update_stock_alert(
            db,
            product
        )

        return product

    @staticmethod
    def get_all_products(
        db: Session
    ):

        return (
            db.query(Product)
            .filter(
                Product.is_active == True
            )
            .order_by(
                Product.product_name.asc()
            )
            .all()
        )

    @staticmethod
    def get_product_by_id(
        db: Session,
        product_id: int
    ):

        product = (
            db.query(Product)
            .filter(
                Product.id == product_id
            )
            .first()
        )

        if not product:
            raise ValueError(
                "Product not found."
            )

        return product

    @staticmethod
    def update_product(
        db: Session,
        product_id: int,
        payload: ProductUpdate
    ):

        product = (
            InventoryService.get_product_by_id(
                db,
                product_id
            )
        )

        updates = payload.model_dump(
            exclude_unset=True
        )

        if "sku" in updates and updates["sku"]:

            existing = (
                db.query(Product)
                .filter(
                    Product.sku == updates["sku"],
                    Product.id != product_id
                )
                .first()
            )

            if existing:
                raise ValueError(
                    "SKU already exists."
                )

        for key, value in updates.items():
            setattr(product, key, value)

        db.commit()
        db.refresh(product)

        InventoryService._update_stock_alert(
            db,
            product
        )

        return product

    @staticmethod
    def deactivate_product(
        db: Session,
        product_id: int
    ):

        product = (
            InventoryService.get_product_by_id(
                db,
                product_id
            )
        )

        product.is_active = False

        db.commit()
        db.refresh(product)

        return product

    # ==========================================================
    # STOCK OPERATIONS
    # ==========================================================

    @staticmethod
    def add_stock(
        db: Session,
        product_id: int,
        quantity: int,
        remarks: str | None = None
    ):

        if quantity <= 0:
            raise ValueError(
                "Quantity must be greater than 0."
            )

        product = (
            InventoryService.get_product_by_id(
                db,
                product_id
            )
        )

        product.current_stock += quantity

        transaction = InventoryTransaction(
            product_id=product.id,
            transaction_type="PURCHASE",
            quantity=quantity,
            remarks=remarks
        )

        db.add(transaction)

        db.commit()
        db.refresh(product)

        InventoryService._update_stock_alert(
            db,
            product
        )

        return product

    @staticmethod
    def remove_stock(
        db: Session,
        product_id: int,
        quantity: int,
        remarks: str | None = None
    ):

        if quantity <= 0:
            raise ValueError(
                "Quantity must be greater than 0."
            )

        product = (
            InventoryService.get_product_by_id(
                db,
                product_id
            )
        )

        if product.current_stock < quantity:
            raise ValueError(
                "Insufficient stock."
            )

        product.current_stock -= quantity

        transaction = InventoryTransaction(
            product_id=product.id,
            transaction_type="ADJUSTMENT",
            quantity=quantity,
            remarks=remarks
        )

        db.add(transaction)

        db.commit()
        db.refresh(product)

        InventoryService._update_stock_alert(
            db,
            product
        )

        return product

    # ==========================================================
    # STOCK ALERT LOGIC
    # ==========================================================

    @staticmethod
    def _update_stock_alert(
        db: Session,
        product: Product
    ):

        current_stock = product.current_stock
        reorder_level = product.reorder_level

        if current_stock <= reorder_level:

            alert_level = "CRITICAL"

        elif current_stock <= (reorder_level * 2):

            alert_level = "MODERATE"

        else:

            alert_level = "HEALTHY"

        existing_alert = (
            db.query(StockAlert)
            .filter(
                StockAlert.product_id == product.id,
                StockAlert.is_resolved == False
            )
            .first()
        )

        message = (
            f"{product.product_name} stock is "
            f"{current_stock}"
        )

        if existing_alert:

            existing_alert.alert_level = alert_level
            existing_alert.current_stock = current_stock
            existing_alert.message = message

        else:

            alert = StockAlert(
                product_id=product.id,
                alert_level=alert_level,
                current_stock=current_stock,
                message=message
            )

            db.add(alert)

        db.commit()
from decimal import Decimal

from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from db.models import (
    Product,
    Sale,
    SaleItem,
    InventoryTransaction,
)

from db.schemas import CheckoutRequest
from services.inventory_service import InventoryService


class CashierService:

    # ==========================================================
    # PRODUCT SEARCH
    # ==========================================================

    @staticmethod
    def search_products(
        db: Session,
        search: str | None = None,
        limit: int = 50,
    ):

        query = (
            db.query(Product)
            .filter(
                Product.is_active.is_(True)
            )
        )

        if search:

            keyword = f"%{search.strip()}%"

            query = query.filter(
                or_(
                    Product.product_name.ilike(keyword),
                    Product.sku.ilike(keyword),
                )
            )

        return (
            query.order_by(
                Product.product_name.asc()
            )
            .limit(limit)
            .all()
        )

    # ==========================================================
    # PRODUCT LOOKUP
    # ==========================================================

    @staticmethod
    def get_product(
        db: Session,
        product_id: int,
    ):

        product = (
            db.query(Product)
            .filter(
                Product.id == product_id,
                Product.is_active.is_(True),
            )
            .first()
        )

        if not product:
            raise ValueError(
                "Product not found."
            )

        return product

    # ==========================================================
    # CREATE SALE
    # ==========================================================

    @staticmethod
    def create_sale(
        db: Session,
        cashier_id: int,
        payload: CheckoutRequest,
    ):

        if not payload.items:
            raise ValueError(
                "Cart cannot be empty."
            )

        products_map = {}

        total_amount = Decimal("0.00")

        # ------------------------------------------------------
        # Validate Stock
        # ------------------------------------------------------

        for item in payload.items:

            product = CashierService.get_product(
                db,
                item.product_id,
            )

            if product.current_stock < item.quantity:

                raise ValueError(
                    f"Insufficient stock for "
                    f"{product.product_name}. "
                    f"Available: {product.current_stock}"
                )

            products_map[item.product_id] = product

            total_amount += (
                Decimal(product.selling_price)
                * item.quantity
            )

        # ------------------------------------------------------
        # Create Sale
        # ------------------------------------------------------

        sale = Sale(
            customer_id=payload.customer_id,
            cashier_id=cashier_id,
            total_amount=total_amount,
            payment_method=payload.payment_method,
        )

        db.add(sale)

        db.flush()

        # ------------------------------------------------------
        # Create Sale Items
        # ------------------------------------------------------

        for item in payload.items:

            product = products_map[item.product_id]

            subtotal = (
                Decimal(product.selling_price)
                * item.quantity
            )

            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.selling_price,
                subtotal=subtotal,
            )

            db.add(sale_item)

            # ----------------------------------------------
            # Deduct Stock
            # ----------------------------------------------

            product.current_stock -= item.quantity

            # ----------------------------------------------
            # Inventory Transaction
            # ----------------------------------------------

            transaction = InventoryTransaction(
                product_id=product.id,
                transaction_type="SALE",
                quantity=item.quantity,
                reference_id=sale.id,
                remarks=f"Sale #{sale.id}",
            )

            db.add(transaction)

            # ----------------------------------------------
            # Update Alert
            # ----------------------------------------------

            InventoryService._update_stock_alert(
                db,
                product,
            )

        db.commit()

        db.refresh(sale)

        return sale

    # ==========================================================
    # SALE DETAILS
    # ==========================================================

    @staticmethod
    def get_sale_by_id(
        db: Session,
        sale_id: int,
        cashier_id: int,
    ):

        sale = (
            db.query(Sale)
            .options(
                joinedload(Sale.sale_items)
                .joinedload(SaleItem.product),

                joinedload(Sale.cashier),

                joinedload(Sale.customer),
            )
            .filter(
                Sale.id == sale_id,
                Sale.cashier_id == cashier_id,
            )
            .first()
        )

        if not sale:
            raise ValueError(
                "Sale not found."
            )

        return sale

    # ==========================================================
    # RECEIPT
    # ==========================================================

    @staticmethod
    def get_sale_receipt(
        db: Session,
        sale_id: int,
        cashier_id: int,
    ):

        return CashierService.get_sale_by_id(
            db,
            sale_id,
            cashier_id,
        )

    # ==========================================================
    # SALE HISTORY
    # ==========================================================

    @staticmethod
    def get_sale_history(
        db: Session,
        cashier_id: int | None = None,
        limit: int = 100,
    ):

        query = (
            db.query(Sale)
            .options(
                joinedload(Sale.customer),
                joinedload(Sale.cashier),
            )
        )

        if cashier_id:

            query = query.filter(
                Sale.cashier_id == cashier_id
            )

        return (
            query.order_by(
                Sale.sale_date.desc()
            )
            .limit(limit)
            .all()
        )

    # ==========================================================
    # CASHIER SALES ONLY
    # ==========================================================

    @staticmethod
    def get_cashier_sales(
        db: Session,
        cashier_id: int,
        limit: int = 100,
    ):

        return CashierService.get_sale_history(
            db=db,
            cashier_id=cashier_id,
            limit=limit,
        )

    # ==========================================================
    # DAILY SALES
    # ==========================================================

    @staticmethod
    def get_today_sales_total(
        db: Session,
        cashier_id: int | None = None,
    ):

        from sqlalchemy import func

        query = db.query(
            func.coalesce(
                func.sum(Sale.total_amount),
                0,
            )
        )

        if cashier_id:

            query = query.filter(
                Sale.cashier_id == cashier_id
            )

        total = query.scalar()

        return total or Decimal("0.00")

    # ==========================================================
    # Inbound
    # ==========================================================

    @staticmethod
    def stock_in(
        db: Session,
        product_id: int,
        quantity: int,
        remarks: str | None = None,
    ):

        product = CashierService.get_product(
            db,
            product_id,
        )

        previous_stock = product.current_stock

        product.current_stock += quantity

        transaction = InventoryTransaction(
            product_id=product.id,
            transaction_type="PURCHASE",
            quantity=quantity,
            remarks=remarks or "Stock received",
        )

        db.add(transaction)

        InventoryService._update_stock_alert(
            db,
            product,
        )

        db.commit()

        db.refresh(product)

        return {
            "product_id": product.id,
            "product_name": product.product_name,
            "previous_stock": previous_stock,
            "added_quantity": quantity,
            "current_stock": product.current_stock,
            "message": "Stock updated successfully.",
        }
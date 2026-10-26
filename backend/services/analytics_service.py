from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from sqlalchemy import func

from db.models import (
    Category,
    Product,
    Sale,
    SaleItem
)

from db.schemas import (
    CategoryCard,
    CategoryPopupProduct,
    CategoryDetailsResponse,
    StockInsightItem,
    DashboardInsights,
    DashboardStats,
    TopSellingProduct,
    DashboardResponse
)


class AnalyticsService:

    # ==========================================================
    # DASHBOARD STATS
    # ==========================================================

    @staticmethod
    def get_dashboard_stats(
        db: Session
    ) -> DashboardStats:

        total_categories = (
            db.query(Category)
            .count()
        )

        total_products = (
            db.query(Product)
            .filter(Product.is_active == True)
            .count()
        )

        total_stock = (
            db.query(
                func.coalesce(
                    func.sum(Product.current_stock),
                    0
                )
            )
            .scalar()
        )

        return DashboardStats(
            total_categories=total_categories,
            total_products=total_products,
            total_stock=total_stock
        )

    # ==========================================================
    # CATEGORY CARDS
    # ==========================================================

    @staticmethod
    def get_category_cards(
        db: Session
    ) -> list[CategoryCard]:

        results = (
            db.query(
                Category.id.label("category_id"),
                Category.category_name,
                func.count(Product.id).label(
                    "total_products"
                ),
                func.coalesce(
                    func.sum(
                        Product.current_stock
                    ),
                    0
                ).label("total_stock")
            )
            .outerjoin(
                Product,
                Product.category_id == Category.id
            )
            .group_by(
                Category.id,
                Category.category_name
            )
            .order_by(
                Category.category_name.asc()
            )
            .all()
        )

        return [
            CategoryCard(
                category_id=row.category_id,
                category_name=row.category_name,
                total_products=row.total_products,
                total_stock=row.total_stock
            )
            for row in results
        ]

    # ==========================================================
    # CATEGORY DETAILS POPUP
    # ==========================================================

    @staticmethod
    def get_category_details(
        db: Session,
        category_id: int
    ) -> CategoryDetailsResponse:

        category = (
            db.query(Category)
            .filter(
                Category.id == category_id
            )
            .first()
        )

        if not category:
            raise ValueError(
                "Category not found."
            )

        today = datetime.utcnow().date()

        products = []

        category_products = (
            db.query(Product)
            .filter(
                Product.category_id == category_id,
                Product.is_active == True
            )
            .all()
        )

        for product in category_products:

            sold_today = (
                db.query(
                    func.coalesce(
                        func.sum(
                            SaleItem.quantity
                        ),
                        0
                    )
                )
                .join(
                    Sale,
                    Sale.id == SaleItem.sale_id
                )
                .filter(
                    SaleItem.product_id
                    == product.id,
                    func.date(
                        Sale.sale_date
                    ) == today
                )
                .scalar()
            )

            products.append(
                CategoryPopupProduct(
                    product_id=product.id,
                    product_name=product.product_name,
                    current_stock=product.current_stock,
                    sold_today=sold_today
                )
            )

        return CategoryDetailsResponse(
            category_name=category.category_name,
            products=products
        )

    # ==========================================================
    # AI INSIGHTS
    # ==========================================================

    @staticmethod
    def get_stock_insights(
        db: Session
    ) -> DashboardInsights:

        products = (
            db.query(Product)
            .filter(
                Product.is_active == True
            )
            .all()
        )

        critical = []
        moderate = []
        healthy = []

        for product in products:

            item = StockInsightItem(
                product_id=product.id,
                product_name=product.product_name,
                current_stock=product.current_stock,
                reorder_level=product.reorder_level
            )

            if (
                product.current_stock
                <= product.reorder_level
            ):
                critical.append(item)

            elif (
                product.current_stock
                <= product.reorder_level * 2
            ):
                moderate.append(item)

            else:
                healthy.append(item)

        return DashboardInsights(
            critical=critical,
            moderate=moderate,
            healthy=healthy
        )

    # ==========================================================
    # TOP 5 PRODUCTS
    # ==========================================================

    @staticmethod
    def get_top_selling_products(
        db: Session,
        days: int = 3
    ) -> list[TopSellingProduct]:

        start_date = (
            datetime.utcnow()
            - timedelta(days=days)
        )

        results = (
            db.query(
                Product.id.label(
                    "product_id"
                ),
                Product.product_name,
                func.sum(
                    SaleItem.quantity
                ).label(
                    "quantity_sold"
                )
            )
            .join(
                SaleItem,
                SaleItem.product_id
                == Product.id
            )
            .join(
                Sale,
                Sale.id
                == SaleItem.sale_id
            )
            .filter(
                Sale.sale_date
                >= start_date
            )
            .group_by(
                Product.id,
                Product.product_name
            )
            .order_by(
                func.sum(
                    SaleItem.quantity
                ).desc()
            )
            .limit(5)
            .all()
        )

        return [
            TopSellingProduct(
                product_id=row.product_id,
                product_name=row.product_name,
                quantity_sold=row.quantity_sold
            )
            for row in results
        ]

    # ==========================================================
    # COMPLETE DASHBOARD
    # ==========================================================

    @staticmethod
    def get_dashboard(
        db: Session
    ) -> DashboardResponse:

        return DashboardResponse(
            stats=AnalyticsService.get_dashboard_stats(
                db
            ),
            cards=AnalyticsService.get_category_cards(
                db
            ),
            insights=AnalyticsService.get_stock_insights(
                db
            ),
            top_selling=AnalyticsService.get_top_selling_products(
                db
            )
        )
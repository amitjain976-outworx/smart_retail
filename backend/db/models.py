from enum import Enum as PyEnum

from sqlalchemy import (
    Column,
    Integer,
    BigInteger,
    String,
    Boolean,
    Text,
    ForeignKey,
    DECIMAL,
    TIMESTAMP,
    Enum,
    text,
)
from sqlalchemy.orm import relationship

from db.database import Base


# ==========================================================
# ENUMS
# ==========================================================

class TransactionType(str, PyEnum):
    PURCHASE = "PURCHASE"
    SALE = "SALE"
    ADJUSTMENT = "ADJUSTMENT"
    RETURN = "RETURN"


class PaymentMethod(str, PyEnum):
    CASH = "CASH"
    CARD = "CARD"
    UPI = "UPI"


class AlertLevel(str, PyEnum):
    CRITICAL = "CRITICAL"
    MODERATE = "MODERATE"
    HEALTHY = "HEALTHY"

# ==========================================================
# ROLE
# ==========================================================

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False)

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    users = relationship("User", back_populates="role")


# ==========================================================
# USER
# ==========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)

    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True)

    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    role = relationship("Role", back_populates="users")
    customer_sales = relationship("Sale", foreign_keys="Sale.customer_id", back_populates="customer")
    cashier_sales = relationship("Sale", foreign_keys="Sale.cashier_id", back_populates="cashier")


# ==========================================================
# CATEGORY
# ==========================================================

class Category(Base):
    __tablename__ = "categories"

    id = Column(BigInteger, primary_key=True, index=True)

    category_name = Column(
        String(100),
        unique=True,
        nullable=False
    )

    description = Column(Text)

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP")
    )

    products = relationship(
        "Product",
        back_populates="category"
    )

    layout = relationship(
        "StoreLayout",
        back_populates="category",
        uselist=False,
        cascade="all, delete-orphan"
    )


# ==========================================================
# PRODUCT
# ==========================================================

class Product(Base):
    __tablename__ = "products"

    id = Column(BigInteger, primary_key=True, index=True)

    category_id = Column(
        BigInteger,
        ForeignKey("categories.id"),
        nullable=False,
        index=True
    )

    product_name = Column(
        String(150),
        nullable=False
    )

    sku = Column(
        String(50),
        unique=True
    )

    selling_price = Column(
        DECIMAL(10, 2),
        nullable=False
    )

    cost_price = Column(
        DECIMAL(10, 2)
    )

    reorder_level = Column(
        Integer,
        default=10
    )

    current_stock = Column(
        Integer,
        nullable=False,
        default=0
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    image_url = Column(
        String(500)
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP")
    )

    category = relationship(
        "Category",
        back_populates="products"
    )

    inventory_transactions = relationship(
        "InventoryTransaction",
        back_populates="product"
    )

    sale_items = relationship(
        "SaleItem",
        back_populates="product"
    )

    stock_alerts = relationship(
        "StockAlert",
        back_populates="product"
    )


# ==========================================================
# INVENTORY TRANSACTIONS
# ==========================================================

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(BigInteger, primary_key=True, index=True)

    product_id = Column(
        BigInteger,
        ForeignKey("products.id"),
        nullable=False,
        index=True
    )

    transaction_type = Column(
        Enum(TransactionType),
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    reference_id = Column(
        BigInteger
    )

    remarks = Column(
        String(255)
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    product = relationship(
        "Product",
        back_populates="inventory_transactions"
    )


# ==========================================================
# SALES
# ==========================================================

class Sale(Base):
    __tablename__ = "sales"

    id = Column(BigInteger, primary_key=True, index=True)

    customer_id = Column(
        BigInteger,
        ForeignKey("users.id"),
        nullable=True
    )

    cashier_id = Column(
        BigInteger,
        ForeignKey("users.id"),
        nullable=False
    )

    total_amount = Column(
        DECIMAL(12, 2),
        nullable=False
    )

    payment_method = Column(
        Enum(PaymentMethod),
        nullable=False
    )

    sale_date = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    customer = relationship(
        "User",
        foreign_keys=[customer_id],
        back_populates="customer_sales"
    )

    cashier = relationship(
        "User",
        foreign_keys=[cashier_id],
        back_populates="cashier_sales"
    )

    sale_items = relationship(
        "SaleItem",
        back_populates="sale",
        cascade="all, delete-orphan"
    )


# ==========================================================
# SALE ITEMS
# ==========================================================

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(BigInteger, primary_key=True, index=True)

    sale_id = Column(
        BigInteger,
        ForeignKey("sales.id", ondelete="CASCADE"),
        nullable=False
    )

    product_id = Column(
        BigInteger,
        ForeignKey("products.id"),
        nullable=False
    )

    quantity = Column(Integer, nullable=False)

    unit_price = Column(DECIMAL(10, 2), nullable=False)

    subtotal = Column(DECIMAL(12, 2), nullable=False)

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    sale = relationship(
        "Sale",
        back_populates="sale_items"
    )

    product = relationship("Product", back_populates="sale_items")


# ==========================================================
# STOCK ALERTS
# ==========================================================

class StockAlert(Base):
    __tablename__ = "stock_alerts"

    id = Column(BigInteger, primary_key=True, index=True)

    product_id = Column(
        BigInteger,
        ForeignKey("products.id"),
        nullable=False
    )

    alert_level = Column(
        Enum(AlertLevel),
        nullable=False,
        index=True
    )

    current_stock = Column(
        Integer,
        nullable=False,
        index=True
    )

    message = Column(String(255))

    is_resolved = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    product = relationship(
        "Product",
        back_populates="stock_alerts"
    )


# ==========================================================
# STORE LAYOUT
# ==========================================================

class StoreLayout(Base):
    __tablename__ = "store_layout"

    id = Column(
        BigInteger,
        primary_key=True,
        index=True
    )

    category_id = Column(
        BigInteger,
        ForeignKey(
            "categories.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        unique=True
    )

    x = Column(Integer, nullable=False)
    y = Column(Integer, nullable=False)

    width = Column(Integer, nullable=False, default=180)
    height = Column(Integer, nullable=False, default=80)
    rotation = Column(Integer, nullable=False, default=0)
    color = Column(String(20), default="#3B82F6")

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP")
    )

    category = relationship("Category", back_populates="layout")



class StorePath(Base):
    __tablename__ = "store_paths"

    id = Column(BigInteger, primary_key=True, index=True)

    path_name = Column(String(100), nullable=False)

    x = Column(Integer, nullable=False)
    y = Column(Integer, nullable=False)

    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)

    rotation = Column(Integer, default=0)
    color = Column(String(20), default="#E5E7EB")

    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP")
    )

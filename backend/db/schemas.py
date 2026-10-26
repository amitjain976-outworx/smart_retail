from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional
import re
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ==========================================================
# ENUMS
# ==========================================================

class TransactionType(str, Enum):
    PURCHASE = "PURCHASE"
    SALE = "SALE"
    ADJUSTMENT = "ADJUSTMENT"
    RETURN = "RETURN"


class PaymentMethod(str, Enum):
    CASH = "CASH"
    CARD = "CARD"
    UPI = "UPI"


class AlertLevel(str, Enum):
    CRITICAL = "CRITICAL"
    MODERATE = "MODERATE"
    HEALTHY = "HEALTHY"


# ==========================================================
# AUTH
# ==========================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    full_name: str
    email: EmailStr
    role: str


# ==========================================================
# ROLE
# ==========================================================

class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role_name: str


# ==========================================================
# USER
# ==========================================================

class UserCreate(BaseModel):
    role_id: int
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if len(value) < 8:
            raise ValueError(
                "Password must be at least 8 characters."
            )

        if not re.search(r"[A-Z]", value):
            raise ValueError(
                "Password must contain an uppercase letter."
            )

        if not re.search(r"[a-z]", value):
            raise ValueError(
                "Password must contain a lowercase letter."
            )

        if not re.search(r"\d", value):
            raise ValueError(
                "Password must contain a number."
            )

        return value


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    is_active: bool
    created_at: datetime
    role: RoleResponse

# ==========================================================
# CATEGORY
# ==========================================================

class CategoryCreate(BaseModel):
    category_name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None


class CategoryUpdate(BaseModel):
    category_name: Optional[str] = None
    description: Optional[str] = None


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime


# ==========================================================
# PRODUCT
# ==========================================================

class ProductCreate(BaseModel):
    category_id: int
    product_name: str = Field(..., min_length=2, max_length=150)
    sku: Optional[str] = None

    selling_price: Decimal = Field(..., gt=0)

    cost_price: Optional[Decimal] = Field(default=None, ge=0)
    current_stock: int = Field(default=0, ge=0)
    reorder_level: int = Field(default=10, ge=0)
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    product_name: Optional[str] = None
    sku: Optional[str] = None

    selling_price: Optional[Decimal] = Field(default=None, gt=0)
    cost_price: Optional[Decimal] = Field(default=None, ge=0)
    current_stock: Optional[int] = Field(default=None, ge=0)
    reorder_level: Optional[int] = Field(default=None, ge=0)

    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_id: int
    product_name: str
    sku: Optional[str]
    selling_price: Decimal
    cost_price: Optional[Decimal]
    reorder_level: int
    current_stock: int
    image_url: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ==========================================================
# STORE LAYOUT
# ==========================================================

class LayoutItem(BaseModel):
    category_id: int

    x: int = Field(..., ge=0)
    y: int = Field(..., ge=0)

    width: int = Field(default=180, gt=0)
    height: int = Field(default=80, gt=0)

    rotation: int = Field(default=0, ge=0, le=360)

    color: str = "#3B82F6"


class LayoutSaveRequest(BaseModel):
    items: List[LayoutItem]

class LayoutProductResponse(BaseModel):
    id: int
    product_name: str
    current_stock: int
    reorder_level: int
    selling_price: Decimal
    image_url: Optional[str]

    model_config = ConfigDict(from_attributes=True)
    

class LayoutResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int

    category_id: int
    category_name: str

    total_stock: int
    product_count: int

    products: List[LayoutProductResponse]

    x: int
    y: int

    width: int
    height: int

    rotation: int
    color: str

    created_at: datetime
    updated_at: datetime

class LayoutListResponse(BaseModel):
    items: List[LayoutResponse]

class LayoutDeleteResponse(BaseModel):
    message: str

class LayoutResetResponse(BaseModel):
    message: str

class LayoutCategoryResponse(BaseModel):
    id: int
    category_name: str

    model_config = ConfigDict(from_attributes=True)

# ==========================================================
# INVENTORY
# ==========================================================

class InventoryTransactionCreate(BaseModel):
    product_id: int
    transaction_type: TransactionType
    quantity: int
    reference_id: Optional[int] = None
    remarks: Optional[str] = None


class InventoryTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    transaction_type: TransactionType
    quantity: int
    reference_id: Optional[int]
    remarks: Optional[str]
    created_at: datetime


# ==========================================================
# SALE ITEMS
# ==========================================================

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class SaleItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    created_at: datetime


# ==========================================================
# SALES
# ==========================================================

class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    payment_method: PaymentMethod
    items: List[SaleItemCreate]


class SaleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: Optional[int]
    cashier_id: int
    total_amount: Decimal
    payment_method: PaymentMethod
    sale_date: datetime
    sale_items: List[SaleItemResponse]


# ==========================================================
# STOCK ALERT
# ==========================================================

class StockAlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    alert_level: AlertLevel
    current_stock: int
    message: Optional[str]
    is_resolved: bool
    created_at: datetime


# ==========================================================
# DASHBOARD
# ==========================================================

class CategoryCard(BaseModel):
    category_id: int
    category_name: str
    total_products: int
    total_stock: int

    model_config = ConfigDict(from_attributes=True)


class CategoryPopupProduct(BaseModel):
    product_id: int
    product_name: str
    current_stock: int
    sold_today: int

    model_config = ConfigDict(from_attributes=True)


class CategoryDetailsResponse(BaseModel):
    category_name: str
    products: List[CategoryPopupProduct]

    model_config = ConfigDict(from_attributes=True)


class StockInsightItem(BaseModel):
    product_id: int
    product_name: str
    current_stock: int
    reorder_level: int

    model_config = ConfigDict(from_attributes=True)


class DashboardInsights(BaseModel):
    critical: List[StockInsightItem]
    moderate: List[StockInsightItem]
    healthy: List[StockInsightItem]

    model_config = ConfigDict(from_attributes=True)


class TopSellingProduct(BaseModel):
    product_id: int
    product_name: str
    quantity_sold: int

    model_config = ConfigDict(from_attributes=True)


class DashboardStats(BaseModel):
    total_categories: int
    total_products: int
    total_stock: int

    model_config = ConfigDict(from_attributes=True)


class DashboardResponse(BaseModel):
    stats: DashboardStats
    cards: List[CategoryCard]
    insights: DashboardInsights
    top_selling: List[TopSellingProduct]

    model_config = ConfigDict(from_attributes=True)


class CategorySummary(BaseModel):
    id: int
    category_name: str

    model_config = ConfigDict(from_attributes=True)


class ProductSummary(BaseModel):
    id: int
    product_name: str
    current_stock: int

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# COMMON RESPONSE
# ==========================================================

class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str


class CategoryDropdown(BaseModel):
    id: int
    category_name: str

    model_config = ConfigDict(from_attributes=True)


# ==========================================================
# STORE PATHS
# ==========================================================

class PathCreateResponse(BaseModel):
    message: str
    id: int

class PathCreate(BaseModel):
    path_name: str

    x: int = Field(..., ge=0)
    y: int = Field(..., ge=0)

    width: int = Field(..., gt=0)
    height: int = Field(..., gt=0)

    rotation: int = Field(default=0, ge=0, le=360)

    color: str = "#E5E7EB"


class PathResponse(BaseModel):
    id: int

    path_name: str

    x: int
    y: int

    width: int
    height: int

    rotation: int

    color: str

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class PathUpdate(BaseModel):

    path_name: Optional[str] = Field(default=None, min_length=2, max_length=100)

    x: Optional[int] = Field(default=None, ge=0)
    y: Optional[int] = Field(default=None, ge=0)

    width: Optional[int] = Field(default=None, gt=0)
    height: Optional[int] = Field(default=None, gt=0)

    rotation: Optional[int] = Field(default=0, ge=0, le=360)

    color: Optional[str] = None


class PathListResponse(BaseModel):

    items: List[PathResponse]

class PathDeleteResponse(BaseModel):
    message: str


class PathResetResponse(BaseModel):
    message: str


# ==========================================================
# CASHIER / POS
# ==========================================================
class CashierProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_name: str
    sku: Optional[str]
    category_id: int
    selling_price: Decimal
    current_stock: int
    image_url: Optional[str]

class CartItem(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class CheckoutRequest(BaseModel):
    customer_id: Optional[int] = None
    payment_method: PaymentMethod
    items: List[CartItem]

class ReceiptItem(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

class CheckoutResponse(BaseModel):
    sale_id: int
    cashier_id: int
    customer_id: Optional[int]
    payment_method: PaymentMethod
    total_amount: Decimal
    sale_date: datetime
    items: List[ReceiptItem]

class ProductSearchResponse(BaseModel):
    items: List[CashierProductResponse]


class ReceiptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sale_id: int
    cashier_name: str
    customer_name: Optional[str]
    payment_method: PaymentMethod
    total_amount: Decimal
    sale_date: datetime
    items: List[ReceiptItem]


class SaleHistoryItem(BaseModel):
    sale_id: int
    sale_date: datetime
    total_amount: Decimal
    payment_method: PaymentMethod
    customer_name: Optional[str]

class SaleHistoryResponse(BaseModel):
    items: List[SaleHistoryItem]


class ProductLookupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: Optional[str]
    product_name: str
    selling_price: Decimal
    current_stock: int

class PaymentSummary(BaseModel):
    subtotal: Decimal
    total_items: int
    total_quantity: int
    grand_total: Decimal

class TransactionSuccessResponse(BaseModel):
    message: str
    sale_id: int

class StockInRequest(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    remarks: Optional[str] = None


class StockInResponse(BaseModel):
    product_id: int
    product_name: str
    previous_stock: int
    added_quantity: int
    current_stock: int
    message: str
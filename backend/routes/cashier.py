from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User
from core.dependencies import get_current_cashier
from services.cashier_service import CashierService

from db.schemas import (
    CheckoutRequest,
    CheckoutResponse,
    ProductSearchResponse,
    ReceiptResponse,
    SaleHistoryResponse,
    CashierProductResponse,
    StockInRequest,
    StockInResponse,
)


router = APIRouter(
    prefix="/cashier",
    tags=["Cashier"],
)


@router.get(
    "/products/search",
    response_model=ProductSearchResponse,
)
def search_products(
    search: str | None = Query(
        default=None,
        min_length=1,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_cashier
    ),
):

    products = CashierService.search_products(
        db=db,
        search=search,
    )

    return {
        "items": products
    }

@router.get(
    "/products/{product_id}",
    response_model=CashierProductResponse,
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_cashier
    ),
):

    try:

        return CashierService.get_product(
            db,
            product_id,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

@router.post(
    "/checkout",
    response_model=CheckoutResponse,
    status_code=status.HTTP_201_CREATED,
)
def checkout(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_cashier
    ),
):

    try:

        sale = CashierService.create_sale(
            db=db,
            cashier_id=current_user.id,
            payload=payload,
        )


        return {
            "sale_id": sale.id,

            "cashier_id": sale.cashier_id,

            "customer_id": sale.customer_id,

            "payment_method": sale.payment_method,

            "total_amount": sale.total_amount,

            "sale_date": sale.sale_date,

            "items": [
                {
                    "product_id": item.product_id,

                    "product_name":
                        item.product.product_name,

                    "quantity": item.quantity,

                    "unit_price":
                        item.unit_price,

                    "subtotal":
                        item.subtotal,
                }

                for item in sale.sale_items
            ],
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Failed to create sale."
        )


@router.get(
    "/sales",
    response_model=SaleHistoryResponse,
)
def sale_history(
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_cashier
    ),
):

    sales = CashierService.get_cashier_sales(
        db=db,
        cashier_id=current_user.id,
        limit=limit,
    )

    return {
        "items": [
            {
                "sale_id": sale.id,
                "sale_date": sale.sale_date,
                "total_amount": sale.total_amount,
                "payment_method": sale.payment_method,
                "customer_name":
                    sale.customer.full_name
                    if sale.customer
                    else None,
            }
            for sale in sales
        ]
    }


@router.get(
    "/sales/{sale_id}",
    response_model=ReceiptResponse,
)
def get_sale_details(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_cashier
    ),
):

    try:

        sale = CashierService.get_sale_by_id(
            db,
            sale_id,
            current_user.id,
        )

        return {
            "sale_id": sale.id,

            "cashier_name":
                sale.cashier.full_name,

            "customer_name":
                sale.customer.full_name
                if sale.customer
                else None,

            "payment_method":
                sale.payment_method,

            "total_amount":
                sale.total_amount,

            "sale_date":
                sale.sale_date,

            "items": [
                {
                    "product_id":
                        item.product_id,

                    "product_name":
                        item.product.product_name,

                    "quantity":
                        item.quantity,

                    "unit_price":
                        item.unit_price,

                    "subtotal":
                        item.subtotal,
                }
                for item in sale.sale_items
            ],
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

@router.get(
    "/receipt/{sale_id}",
    response_model=ReceiptResponse,
)
def get_receipt(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_cashier
    ),
):

    try:

        sale = CashierService.get_sale_receipt(
            db,
            sale_id,
             current_user.id
        )

        return {
            "sale_id": sale.id,

            "cashier_name":
                sale.cashier.full_name,

            "customer_name":
                sale.customer.full_name
                if sale.customer
                else None,

            "payment_method":
                sale.payment_method,

            "total_amount":
                sale.total_amount,

            "sale_date":
                sale.sale_date,

            "items": [
                {
                    "product_id":
                        item.product_id,

                    "product_name":
                        item.product.product_name,

                    "quantity":
                        item.quantity,

                    "unit_price":
                        item.unit_price,

                    "subtotal":
                        item.subtotal,
                }
                for item in sale.sale_items
            ],
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

@router.post(
    "/stock-in",
    response_model=StockInResponse,
)
def stock_in(
    payload: StockInRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_cashier
    ),
):

    try:

        return CashierService.stock_in(
            db=db,
            product_id=payload.product_id,
            quantity=payload.quantity,
            remarks=payload.remarks,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
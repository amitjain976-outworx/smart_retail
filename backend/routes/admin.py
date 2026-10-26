from fastapi import APIRouter, Depends, HTTPException, status

from pydantic import BaseModel
from typing import Optional

from sqlalchemy.orm import Session

from db.database import get_db

from db.schemas import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    DashboardResponse,
    CategoryDetailsResponse,
    DashboardInsights,
    TopSellingProduct,
    MessageResponse
)

from services.inventory_service import InventoryService
from services.analytics_service import AnalyticsService
from core.dependencies import get_current_admin

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# ==========================================================
# DASHBOARD
# ==========================================================


@router.get(
    "/dashboard",
    response_model=DashboardResponse
)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    return AnalyticsService.get_dashboard(db)


@router.get(
    "/category-details/{category_id}",
    response_model=CategoryDetailsResponse
)
def get_category_details(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    try:

        return AnalyticsService.get_category_details(
            db,
            category_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get(
    "/insights",
    response_model=DashboardInsights
)
def get_stock_insights(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    return AnalyticsService.get_stock_insights(db)


@router.get(
    "/top-products",
    response_model=list[TopSellingProduct]
)
def get_top_products(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    return AnalyticsService.get_top_selling_products(
        db
    )


# ==========================================================
# CATEGORY CRUD
# ==========================================================


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED
)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):

    try:

        return InventoryService.create_category(
            db,
            payload
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/categories",
    response_model=list[CategoryResponse]
)
def get_categories(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):

    return InventoryService.get_all_categories(
        db
    )


@router.put(
    "/categories/{category_id}",
    response_model=CategoryResponse
)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):

    try:

        return InventoryService.update_category(
            db,
            category_id,
            payload
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.delete(
    "/categories/{category_id}",
    response_model=MessageResponse
)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):

    try:

        InventoryService.delete_category(
            db,
            category_id
        )

        return MessageResponse(
            message="Category deleted successfully."
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ==========================================================
# PRODUCT CRUD
# ==========================================================


@router.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):

    try:

        return InventoryService.create_product(
            db,
            payload
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/products",
    response_model=list[ProductResponse]
)
def get_products(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):

    return InventoryService.get_all_products(
        db
    )


@router.put(
    "/products/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):

    try:

        return InventoryService.update_product(
            db,
            product_id,
            payload
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete(
    "/products/{product_id}",
    response_model=MessageResponse
)
def deactivate_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):

    try:

        InventoryService.deactivate_product(
            db,
            product_id
        )

        return MessageResponse(
            message="Product deactivated successfully."
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# ==========================================================
# STOCK MANAGEMENT
# ==========================================================


@router.post(
    "/products/{product_id}/add-stock",
    response_model=ProductResponse
)
def add_stock(
    product_id: int,
    quantity: int,
    remarks: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):

    try:

        return InventoryService.add_stock(
            db,
            product_id,
            quantity,
            remarks
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post(
    "/products/{product_id}/remove-stock",
    response_model=ProductResponse
)
def remove_stock(
    product_id: int,
    quantity: int,
    remarks: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):

    try:

        return InventoryService.remove_stock(
            db,
            product_id,
            quantity,
            remarks
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
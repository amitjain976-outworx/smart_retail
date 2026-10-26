from typing import List

from fastapi import (
    APIRouter,
    Depends,
    status
)

from sqlalchemy.orm import Session

from db.database import get_db

from db.schemas import (
    LayoutSaveRequest,
    LayoutResponse,
    LayoutDeleteResponse,
    LayoutResetResponse,
    LayoutItem,
    MessageResponse,
    CategorySummary,

    PathCreate,
    PathUpdate,
    PathResponse,
    PathListResponse,
    PathDeleteResponse,
    PathResetResponse,
    PathCreateResponse,
)

from services.layout_service import LayoutService


router = APIRouter(
    prefix="/layout",
    tags=["Store Layout"]
)


# ==========================================================
# Get Complete Layout
# ==========================================================

@router.get(
    "",
    response_model=List[LayoutResponse],
    status_code=status.HTTP_200_OK
)
def get_layout(
    db: Session = Depends(get_db)
):
    """
    Returns complete store layout.
    """

    return LayoutService.get_layout(db)


# ==========================================================
# Save Complete Layout
# ==========================================================

@router.post(
    "/save",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK
)
def save_layout(
    payload: LayoutSaveRequest,
    db: Session = Depends(get_db)
):
    """
    Save complete layout.

    Existing blocks are updated.
    New blocks are created.
    """

    result = LayoutService.save_layout(
        db=db,
        payload=payload
    )

    return {
        "message": result["message"]
    }


# ==========================================================
# Update Single Layout Item
# ==========================================================

@router.put(
    "/{category_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK
)
def update_layout_item(
    category_id: int,
    item: LayoutItem,
    db: Session = Depends(get_db)
):
    """
    Update single category block.
    """

    return LayoutService.update_layout_item(
        db=db,
        category_id=category_id,
        item=item
    )


# ==========================================================
# Delete Layout Item
# ==========================================================

@router.delete(
    "/{category_id}",
    response_model=LayoutDeleteResponse,
    status_code=status.HTTP_200_OK
)
def delete_layout_item(
    category_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete one layout block.
    """

    return LayoutService.delete_layout_item(
        db=db,
        category_id=category_id
    )


# ==========================================================
# Reset Entire Layout
# ==========================================================

@router.delete(
    "/reset/all",
    response_model=LayoutResetResponse,
    status_code=status.HTTP_200_OK
)
def reset_layout(
    db: Session = Depends(get_db)
):
    """
    Delete all layout blocks.
    """

    return LayoutService.reset_layout(db)


# ==========================================================
# Available Categories
# ==========================================================

@router.get(
    "/available-categories",
    response_model=List[CategorySummary],
    status_code=status.HTTP_200_OK
)
def get_available_categories(
    db: Session = Depends(get_db)
):
    """
    Returns categories that are not
    yet placed on the layout.
    """

    return LayoutService.get_available_categories(db)



@router.get(
    "/paths",
    response_model=list[PathResponse],
    status_code=status.HTTP_200_OK,
)
def get_paths(
    db: Session = Depends(get_db),
):
    """
    Returns all store walkable paths.
    """

    return LayoutService.get_all_paths(db)


@router.post(
    "/paths",
    response_model=PathCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_path(
    payload: PathCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new walkable path.
    """

    result = LayoutService.create_path(
        db=db,
        payload=payload,
    )

    return {
        "message": result["message"],
        "id": result["path"]["id"]
    }


@router.put(
    "/paths/{path_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
)
def update_path(
    path_id: int,
    payload: PathUpdate,
    db: Session = Depends(get_db),
):
    """
    Update an existing path.
    """

    return LayoutService.update_path(
        db=db,
        path_id=path_id,
        payload=payload,
    )


@router.delete(
    "/paths/{path_id}",
    response_model=PathDeleteResponse,
    status_code=status.HTTP_200_OK,
)
def delete_path(
    path_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a path.
    """

    return LayoutService.delete_path(
        db=db,
        path_id=path_id,
    )


@router.delete(
    "/paths/reset/all",
    response_model=PathResetResponse,
    status_code=status.HTTP_200_OK,
)
def reset_paths(
    db: Session = Depends(get_db),
):
    """
    Delete all store paths.
    """

    return LayoutService.reset_paths(db)


from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from db.models import Category, StoreLayout, StorePath, Product
from db.schemas import LayoutItem, LayoutSaveRequest, PathCreate, PathUpdate


class LayoutService:

    # ==========================================================
    # Get Complete Layout
    # ==========================================================

    @staticmethod
    def get_layout(db: Session):
        """
        Returns complete store layout along with
        products belonging to each category.
        """

        layouts = (
            db.query(StoreLayout)
            .join(StoreLayout.category)
            .options(
                joinedload(StoreLayout.category)
                .joinedload(Category.products)
            )
            .order_by(Category.category_name.asc())
            .all()
        )

        response = []

        for layout in layouts:

            category = layout.category

            total_stock = sum(
                product.current_stock
                for product in category.products
            )

            products = [
                {
                    "id": product.id,
                    "product_name": product.product_name,
                    "current_stock": product.current_stock,
                    "reorder_level": product.reorder_level,
                    "selling_price": float(product.selling_price),
                    "image_url": product.image_url,
                }
                for product in sorted(
                    category.products,
                    key=lambda p: p.product_name.lower()
                )
            ]

            response.append(
                {
                    "id": layout.id,

                    "category_id": category.id,
                    "category_name": category.category_name,

                    "total_stock": total_stock,

                    "product_count": len(products),

                    "products": products,

                    "x": layout.x,
                    "y": layout.y,

                    "width": layout.width,
                    "height": layout.height,

                    "rotation": layout.rotation,
                    "color": layout.color,

                    "created_at": layout.created_at,
                    "updated_at": layout.updated_at,
                }
            )

        return response

    
    # ==========================================================
    # Save Entire Layout
    # ==========================================================

    @staticmethod
    def save_layout(
        db: Session,
        payload: LayoutSaveRequest
    ):
        """
        Creates or updates layout items.

        Frontend sends complete layout.
        """

        try:

            # --------------------------------------------------
            # Duplicate Validation
            # --------------------------------------------------

            category_ids = [
                item.category_id
                for item in payload.items
            ]

            if len(category_ids) != len(set(category_ids)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Duplicate category IDs detected."
                )

            # --------------------------------------------------
            # Category Validation
            # --------------------------------------------------

            valid_categories = {
                category.id
                for category in db.query(Category)
                .filter(Category.id.in_(category_ids))
                .all()
            }

            invalid_categories = (
                set(category_ids) - valid_categories
            )

            if invalid_categories:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=(
                        "Invalid category IDs: "
                        f"{list(invalid_categories)}"
                    )
                )

            # --------------------------------------------------
            # Create / Update
            # --------------------------------------------------

            for item in payload.items:

                layout = (
                    db.query(StoreLayout)
                    .filter(
                        StoreLayout.category_id
                        == item.category_id
                    )
                    .first()
                )

                if layout:

                    layout.x = item.x
                    layout.y = item.y
                    layout.width = item.width
                    layout.height = item.height
                    layout.rotation = item.rotation
                    layout.color = item.color

                else:

                    layout = StoreLayout(
                        category_id=item.category_id,
                        x=item.x,
                        y=item.y,
                        width=item.width,
                        height=item.height,
                        rotation=item.rotation,
                        color=item.color,
                    )

                    db.add(layout)

            db.commit()

            return {
                "message": "Layout saved successfully.",
                "total_items": len(payload.items)
            }

        except HTTPException:
            db.rollback()
            raise

        except Exception as e:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save layout: {str(e)}"
            )

    # ==========================================================
    # Update Single Layout Item
    # ==========================================================

    @staticmethod
    def update_layout_item(
        db: Session,
        category_id: int,
        item: LayoutItem
    ):
        """
        Update a single category block.
        Useful for autosave drag-drop.
        """

        layout = (
            db.query(StoreLayout)
            .filter(
                StoreLayout.category_id == category_id
            )
            .first()
        )

        if not layout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Layout item not found."
            )

        try:

            layout.x = item.x
            layout.y = item.y
            layout.width = item.width
            layout.height = item.height
            layout.rotation = item.rotation
            layout.color = item.color

            db.commit()
            db.refresh(layout)

            return {
                "message": "Layout updated successfully."
            }

        except Exception as e:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update layout: {str(e)}"
            )

    # ==========================================================
    # Delete Layout Item
    # ==========================================================

    @staticmethod
    def delete_layout_item(
        db: Session,
        category_id: int
    ):
        """
        Remove one category block from layout.
        Category remains in database.
        """

        layout = (
            db.query(StoreLayout)
            .filter(
                StoreLayout.category_id == category_id
            )
            .first()
        )

        if not layout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Layout item not found."
            )

        try:

            db.delete(layout)
            db.commit()

            return {
                "message": "Layout item deleted successfully."
            }

        except Exception as e:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete layout item: {str(e)}"
            )

    # ==========================================================
    # Reset Layout
    # ==========================================================

    @staticmethod
    def reset_layout(db: Session):
        """
        Remove all layout items.
        Categories remain untouched.
        """

        try:

            db.query(StoreLayout).delete()
            db.commit()

            return {
                "message": "Layout reset successfully."
            }

        except Exception as e:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to reset layout: {str(e)}"
            )

    # ==========================================================
    # Available Categories
    # ==========================================================

    @staticmethod
    def get_available_categories(db: Session):
        """
        Returns categories that are not yet
        placed on layout.
        """

        used_ids = {
            row[0]
            for row in db.query(
                StoreLayout.category_id
            ).all()
        }

        query = db.query(Category)

        if used_ids:
            query = query.filter(
                ~Category.id.in_(used_ids)
            )

        categories = (
            query.order_by(
                Category.category_name.asc()
            )
            .all()
        )

        return [
            {
                "id": category.id,
                "category_name": category.category_name
            }
            for category in categories
        ]

    # ==========================================================
    # Get All Paths
    # ==========================================================

    @staticmethod
    def get_all_paths(db: Session):

        paths = (
            db.query(StorePath)
            .order_by(StorePath.id.asc())
            .all()
        )

        return [
            {
                "id": path.id,
                "path_name": path.path_name,
                "x": path.x,
                "y": path.y,
                "width": path.width,
                "height": path.height,
                "rotation": path.rotation,
                "color": path.color,
                "created_at": path.created_at,
                "updated_at": path.updated_at,
            }
            for path in paths
        ]

    # ==========================================================
    # Create Path
    # ==========================================================

    @staticmethod
    def create_path(
        db: Session,
        payload: PathCreate
    ):

        try:

            path = StorePath(
                path_name=payload.path_name,
                x=payload.x,
                y=payload.y,
                width=payload.width,
                height=payload.height,
                rotation=payload.rotation,
                color=payload.color
            )

            db.add(path)

            db.commit()
            db.refresh(path)

            return {
                "message": "Path created successfully.",
                "path": {
                    "id": path.id,
                    "path_name": path.path_name,
                    "x": path.x,
                    "y": path.y,
                    "width": path.width,
                    "height": path.height,
                    "rotation": path.rotation,
                    "color": path.color,
                    "created_at": path.created_at,
                    "updated_at": path.updated_at,
                }
            }

        except Exception as e:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create path: {str(e)}"
            )


    # ==========================================================
    # Update Path
    # ==========================================================

    @staticmethod
    def update_path(
        db: Session,
        path_id: int,
        payload: PathUpdate
    ):

        path = (
            db.query(StorePath)
            .filter(StorePath.id == path_id)
            .first()
        )

        if not path:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Path not found."
            )

        try:

            update_data = payload.model_dump(exclude_unset=True)

            for field, value in update_data.items():
                setattr(path, field, value)

            db.commit()
            db.refresh(path)

            return {
                "message": "Path updated successfully.",
                "path": path
            }

        except Exception as e:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update path: {str(e)}"
            )

    # ==========================================================
    # Delete Path
    # ==========================================================

    @staticmethod
    def delete_path(
        db: Session,
        path_id: int
    ):

        path = (
            db.query(StorePath)
            .filter(StorePath.id == path_id)
            .first()
        )

        if not path:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Path not found."
            )

        try:

            db.delete(path)
            db.commit()

            return {
                "message": "Path deleted successfully.",
                "deleted_path_id": path_id
            }

        except Exception as e:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete path: {str(e)}"
            )


    # ==========================================================
    # Reset All Paths
    # ==========================================================

    @staticmethod
    def reset_paths(db: Session):

        try:

            db.query(StorePath).delete(synchronize_session=False)
            db.commit()

            return {
                "message": "All paths removed successfully."
            }

        except Exception as e:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to reset paths: {str(e)}"
            )
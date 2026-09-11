import strawberry

from crud import get_products
from database import SessionLocal


@strawberry.type
class ProductType:
    id: int
    product_name: str
    price: float
    quantity: int
    category_id: int
    supplier_id: int
    sku: str
    description: str | None


@strawberry.type
class ProductListType:
    items: list[ProductType]
    total: int
    page: int
    page_size: int
    total_pages: int


@strawberry.type
class Query:

    @strawberry.field
    def products(
        self,
        page: int = 1,
        page_size: int = 10,
        search: str | None = None,
        category_id: int | None = None,
        supplier_id: int | None = None,
        min_price: float | None = None,
        max_price: float | None = None
    ) -> ProductListType:

        db = SessionLocal()

        try:
            products, total = get_products(
                db=db,
                page=page,
                page_size=page_size,
                search=search,
                category_id=category_id,
                supplier_id=supplier_id,
                min_price=min_price,
                max_price=max_price
            )

            items = [
                ProductType(
                    id=product.id,
                    product_name=product.product_name,
                    price=float(product.price),
                    quantity=product.quantity,
                    category_id=product.category_id,
                    supplier_id=product.supplier_id,
                    sku=product.sku,
                    description=product.description
                )
                for product in products
            ]

            total_pages = (
                (total + page_size - 1) // page_size
            )

            return ProductListType(
                items=items,
                total=total,
                page=page,
                page_size=page_size,
                total_pages=total_pages
            )

        finally:
            db.close()


schema = strawberry.Schema(query=Query)
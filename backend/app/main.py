from fastapi import FastAPI, Depends, Query, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import SessionLocal
from crud import (
    create_product,
    get_products,
    get_product,
    update_product,
    delete_product,
    create_category,
    get_categories,
    get_category,
    update_category,
    delete_category,
    create_supplier,
    get_suppliers,
    get_supplier,
    update_supplier,
    delete_supplier,
    stock_in,
    stock_out,
    get_inventory_transactions,
    get_inventory_transaction
)
from schemas import (
    ProductCreate,
    ProductResponse,
    ProductListResponse,
    ProductUpdate,
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    SupplierCreate,
    SupplierResponse,
    SupplierUpdate,
    StockInCreate,
    StockOutCreate,
    InventoryTransactionResponse
)
app = FastAPI()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "Inventory Management API is running"}


@app.post("/products", response_model=ProductResponse)
def create_product_endpoint(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    try:
        created_product = create_product(
            db=db,
            product_name=product.product_name,
            price=product.price,
            quantity=product.quantity,
            category_name=product.category_name,
            supplier_id=product.supplier_id,
            sku=product.sku,
            description=product.description
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="SKU already exists"
        )

    if created_product == "SUPPLIER_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    return created_product

@app.get("/products", response_model=ProductListResponse)
def get_products_endpoint(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),
    search: str | None = None,
    category_id: int | None = None,
    supplier_id: int | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    db: Session = Depends(get_db)
):
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
    total_pages = (total + page_size - 1) // page_size
    return ProductListResponse(
        items=products,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product_endpoint(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = get_product(
        db=db,
        product_id=product_id
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product

@app.put("/products/{product_id}", response_model=ProductResponse)
def update_product_endpoint(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):
    updated_product = update_product(
        db=db,
        product_id=product_id,
        product_name=product.product_name,
        price=product.price,
        quantity=product.quantity,
        category_name=product.category_name,
        supplier_id=product.supplier_id,
        sku=product.sku,
        description=product.description
    )

    if updated_product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return updated_product

@app.delete("/products/{product_id}", response_model=ProductResponse)
def delete_product_endpoint(
    product_id: int,
    db: Session = Depends(get_db)
):
    deleted_product = delete_product(
        db=db,
        product_id=product_id
    )

    if deleted_product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return deleted_product

@app.post("/categories", response_model=CategoryResponse)
def create_category_endpoint(
    category: CategoryCreate,
    db: Session = Depends(get_db)
):
    return create_category(
        db=db,
        name=category.name,
        description=category.description
    )

@app.get("/categories", response_model=list[CategoryResponse])
def list_categories_endpoint(
    db: Session = Depends(get_db)
):
    return get_categories(db=db)

@app.get("/categories/{category_id}", response_model=CategoryResponse)
def get_category_endpoint(
    category_id: int,
    db: Session = Depends(get_db)
):
    category = get_category(
        db=db,
        category_id=category_id
    )

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category

@app.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category_endpoint(
    category_id: int,
    category: CategoryUpdate,
    db: Session = Depends(get_db)
):
    updated_category = update_category(
        db=db,
        category_id=category_id,
        name=category.name,
        description=category.description
    )

    if updated_category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return updated_category

@app.delete("/categories/{category_id}", response_model=CategoryResponse)
def delete_category_endpoint(
    category_id: int,
    db: Session = Depends(get_db)
):
    deleted_category = delete_category(
        db=db,
        category_id=category_id
    )

    if deleted_category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return deleted_category

@app.post("/suppliers", response_model=SupplierResponse)
def create_supplier_endpoint(
    supplier: SupplierCreate,
    db: Session = Depends(get_db)
):
    return create_supplier(
        db=db,
        name=supplier.name,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address
    )

@app.get("/suppliers", response_model=list[SupplierResponse])
def list_suppliers(
    db: Session = Depends(get_db)
):
    return get_suppliers(db=db)

@app.get("/suppliers/{supplier_id}", response_model=SupplierResponse)
def get_supplier_endpoint(
    supplier_id: int,
    db: Session = Depends(get_db)
):
    supplier = get_supplier(
        db=db,
        supplier_id=supplier_id
    )

    if supplier is None:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    return supplier

@app.put("/suppliers/{supplier_id}", response_model=SupplierResponse)
def update_supplier_endpoint(
    supplier_id: int,
    supplier: SupplierUpdate,
    db: Session = Depends(get_db)
):
    updated_supplier = update_supplier(
        db=db,
        supplier_id=supplier_id,
        name=supplier.name,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address
    )

    if updated_supplier is None:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    return updated_supplier

@app.delete("/suppliers/{supplier_id}", response_model=SupplierResponse)
def delete_supplier_endpoint(
    supplier_id: int,
    db: Session = Depends(get_db)
):
    deleted_supplier = delete_supplier(
        db=db,
        supplier_id=supplier_id
    )

    if deleted_supplier is None:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    return deleted_supplier

@app.post(
    "/inventory/stock-in",
    response_model=InventoryTransactionResponse
)
def stock_in_endpoint(
    stock: StockInCreate,
    db: Session = Depends(get_db)
):

    transaction = stock_in(
        db=db,
        product_id=stock.product_id,
        quantity=stock.quantity,
        reference=stock.reference,
        notes=stock.notes
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return transaction

@app.post(
    "/inventory/stock-out",
    response_model=InventoryTransactionResponse
)
def stock_out_endpoint(
    stock: StockOutCreate,
    db: Session = Depends(get_db)
):

    transaction = stock_out(
        db=db,
        product_id=stock.product_id,
        quantity=stock.quantity,
        reference=stock.reference,
        notes=stock.notes
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if transaction == "INSUFFICIENT_STOCK":
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )

    return transaction

@app.get(
    "/inventory/transactions",
    response_model=list[InventoryTransactionResponse]
)
def list_inventory_transactions(
    product_id: int | None = None,
    db: Session = Depends(get_db)
):
    return get_inventory_transactions(
        db=db,
        product_id=product_id
    )

@app.get(
    "/inventory/transactions/{transaction_id}",
    response_model=InventoryTransactionResponse
)
def get_inventory_transaction_endpoint(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    transaction = get_inventory_transaction(
        db=db,
        transaction_id=transaction_id
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Inventory transaction not found"
        )

    return transaction
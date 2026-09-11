from sqlalchemy.orm import Session

from models import Product, Category, Supplier, InventoryTransaction


def create_product(
    db: Session,
    product_name: str,
    price,
    quantity: int,
    category_name: str,
    supplier_id: int,
    sku: str,
    description: str | None = None
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if supplier is None:
        return "SUPPLIER_NOT_FOUND"

    category = get_or_create_category(
        db=db,
        name=category_name
    )

    product = Product(
        product_name=product_name,
        price=price,
        quantity=quantity,
        category_id=category.id,
        supplier_id=supplier_id,
        sku=sku,
        description=description
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()

def get_products(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    category_id: int | None = None,
    supplier_id: int | None = None,
    min_price: float | None = None,
    max_price: float | None = None
):
    query = db.query(Product)

    # Search by product name or SKU
    if search:
        search_pattern = f"%{search}%"

        query = query.filter(
            (Product.product_name.ilike(search_pattern)) |
            (Product.sku.ilike(search_pattern))
        )

    # Filter by category
    if category_id is not None:
        query = query.filter(
            Product.category_id == category_id
        )

    # Filter by supplier
    if supplier_id is not None:
        query = query.filter(
            Product.supplier_id == supplier_id
        )

    # Filter by minimum price
    if min_price is not None:
        query = query.filter(
            Product.price >= min_price
        )

    # Filter by maximum price
    if max_price is not None:
        query = query.filter(
            Product.price <= max_price
        )

    # Count matching products before pagination
    total = query.count()

    # Calculate how many records to skip
    offset = (page - 1) * page_size

    # Get only the requested page
    products = (
        query
        .order_by(Product.id.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return products, total
def update_product(
    db: Session,
    product_id: int,
    product_name: str | None = None,
    price=None,
    quantity: int | None = None,
    category_name: str | None = None,
    supplier_id: int | None = None,
    sku: str | None = None,
    description: str | None = None
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if product is None:
        return None

    if product_name is not None:
        product.product_name = product_name

    if price is not None:
        product.price = price

    if quantity is not None:
        product.quantity = quantity

    if category_name is not None:
        category = get_or_create_category(
            db=db,
            name=category_name
        )
        product.category_id = category.id

    if supplier_id is not None:
        product.supplier_id = supplier_id

    if sku is not None:
        product.sku = sku

    if description is not None:
        product.description = description

    db.commit()
    db.refresh(product)

    return product
def delete_product(db: Session, product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        return None

    db.delete(product)
    db.commit()

    return product
def create_category(
    db: Session,
    name: str,
    description: str | None = None
):
    category = Category(
        name=name,
        description=description
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def get_categories(db: Session):
    return db.query(Category).all()


def get_category(db: Session, category_id: int):
    return db.query(Category).filter(Category.id == category_id).first()


def get_or_create_category(
    db: Session,
    name: str,
    description: str | None = None
):
    category = (
        db.query(Category)
        .filter(Category.name == name)
        .first()
    )

    if category is not None:
        return category

    return create_category(
        db=db,
        name=name,
        description=description
    )

def delete_category(
    db: Session,
    category_id: int
):
    category = get_category(
        db=db,
        category_id=category_id
    )

    if category is None:
        return None

    db.delete(category)
    db.commit()

    return category

def update_category(
    db: Session,
    category_id: int,
    name: str | None = None,
    description: str | None = None
):
    category = get_category(
        db=db,
        category_id=category_id
    )

    if category is None:
        return None

    if name is not None:
        category.name = name

    if description is not None:
        category.description = description

    db.commit()
    db.refresh(category)

    return category

def create_supplier(
    db: Session,
    name: str,
    email: str | None = None,
    phone: str | None = None,
    address: str | None = None
):
    supplier = Supplier(
        name=name,
        email=email,
        phone=phone,
        address=address
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


def get_suppliers(db: Session):
    return db.query(Supplier).all()


def get_supplier(db: Session, supplier_id: int):
    return (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )


def update_supplier(
    db: Session,
    supplier_id: int,
    name: str | None = None,
    email: str | None = None,
    phone: str | None = None,
    address: str | None = None
):
    supplier = get_supplier(
        db=db,
        supplier_id=supplier_id
    )

    if supplier is None:
        return None

    if name is not None:
        supplier.name = name

    if email is not None:
        supplier.email = email

    if phone is not None:
        supplier.phone = phone

    if address is not None:
        supplier.address = address

    db.commit()
    db.refresh(supplier)

    return supplier


def delete_supplier(db: Session, supplier_id: int):
    supplier = get_supplier(
        db=db,
        supplier_id=supplier_id
    )

    if supplier is None:
        return None

    db.delete(supplier)
    db.commit()

    return supplier

def stock_in(
    db: Session,
    product_id: int,
    quantity: int,
    reference: str | None = None,
    notes: str | None = None
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .with_for_update()
        .first()
    )

    if product is None:
        return None

    previous_quantity = product.quantity
    product.quantity += quantity
    new_quantity = product.quantity

    transaction = InventoryTransaction(
        product_id=product.id,
        transaction_type="STOCK_IN",
        quantity=quantity,
        previous_quantity=previous_quantity,
        new_quantity=new_quantity,
        reference=reference,
        notes=notes
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction

def stock_out(
    db: Session,
    product_id: int,
    quantity: int,
    reference: str | None = None,
    notes: str | None = None
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .with_for_update()
        .first()
    )

    if product is None:
        return None

    if product.quantity < quantity:
        return "INSUFFICIENT_STOCK"

    previous_quantity = product.quantity
    product.quantity -= quantity
    new_quantity = product.quantity

    transaction = InventoryTransaction(
        product_id=product.id,
        transaction_type="STOCK_OUT",
        quantity=quantity,
        previous_quantity=previous_quantity,
        new_quantity=new_quantity,
        reference=reference,
        notes=notes
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction

def get_inventory_transactions(
    db: Session,
    product_id: int | None = None
):
    query = db.query(InventoryTransaction)

    if product_id is not None:
        query = query.filter(
            InventoryTransaction.product_id == product_id
        )

    return (
        query
        .order_by(InventoryTransaction.id.desc())
        .all()
    )

def get_inventory_transaction(
    db: Session,
    transaction_id: int
):
    return (
        db.query(InventoryTransaction)
        .filter(
            InventoryTransaction.id == transaction_id
        )
        .first()
    )
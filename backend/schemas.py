from pydantic import BaseModel, Field
from datetime import datetime


class ProductCreate(BaseModel):
    product_name: str
    price: float
    quantity: int
    category_name: str
    supplier_id: int
    sku: str
    description: str | None = None
class ProductResponse(BaseModel):
    id: int
    product_name: str
    price: float
    quantity: int
    category_id: int
    supplier_id: int
    sku: str
    description: str | None = None

    class Config:
        from_attributes = True
      
class CategoryCreate(BaseModel):
    name: str
    description: str | None = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    description: str | None = None

    class Config:
        from_attributes = True
class SupplierCreate(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class SupplierResponse(BaseModel):
    id: int
    name: str
    email: str | None = None
    phone: str | None = None
    address: str | None = None

    class Config:
        from_attributes = True
class ProductUpdate(BaseModel):
    product_name: str | None = None
    price: float | None = None
    quantity: int | None = None
    category_name: str | None = None
    supplier_id: int | None = None
    sku: str | None = None
    description: str | None = None


class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class SupplierUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None

class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class StockInCreate(BaseModel):
    product_id: int
    quantity: int= Field(..., gt=0)
    reference: str | None = None
    notes: str | None = None


class StockOutCreate(BaseModel):
    product_id: int
    quantity: int= Field(..., gt=0) 
    reference: str | None = None
    notes: str | None = None


class InventoryTransactionResponse(BaseModel):
    id: int
    product_id: int
    transaction_type: str
    quantity: int
    previous_quantity: int
    new_quantity: int
    reference: str | None = None
    notes: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
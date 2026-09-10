from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String(255), nullable=True)
class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    address = Column(String(255), nullable=True)
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(150), nullable=False)
    price = Column(String(20), nullable=False)
    quantity = Column(Integer, nullable=False)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)

    sku = Column(String(100), nullable=False, unique=True)
    description = Column(String(500), nullable=True)
    category = relationship("Category")
    supplier = relationship("Supplier")
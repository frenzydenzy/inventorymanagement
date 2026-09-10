import os
from urllib.parse import quote_plus

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv


load_dotenv()

DB_PASSWORD = os.getenv("DB_PASSWORD")

encoded_password = quote_plus(DB_PASSWORD)

DATABASE_URL = (
    f"mysql+pymysql://root:{encoded_password}"
    "@localhost:3306/inventory_db"
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
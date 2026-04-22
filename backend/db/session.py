from sqlmodel import SQLModel, Session, create_engine
from core.config import settings
import db.models
import logging

logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

engine = create_engine(settings.DATABASE_URL)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session
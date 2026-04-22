from sqlmodel import SQLModel, Session, create_engine
from core.config import settings
import db.models

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.ENV == "development"   
)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session
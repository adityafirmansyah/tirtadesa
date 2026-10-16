from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.routers import (
    audit_air,
    auth,
    catatan_meter,
    kas,
    pelanggan,
    public_portal,
    tagihan,
    tarif,
    tenants,
    users,
)
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables & ensure indexes
    Base.metadata.create_all(bind=engine)

    # Enable SQLite WAL mode and busy_timeout for fast concurrent reads
    if settings.DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            conn.exec_driver_sql("PRAGMA journal_mode=WAL;")
            conn.exec_driver_sql("PRAGMA synchronous=NORMAL;")
            conn.exec_driver_sql("PRAGMA busy_timeout=5000;")

    # Auto seed if configured
    if settings.AUTO_SEED:
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Sistem Pengelolaan Air Bersih Komunitas Desa (KPSPAMS / HIPPAM / SPAMDes)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for receipts / photo uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(tenants.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(tarif.router, prefix="/api")
app.include_router(pelanggan.router, prefix="/api")
app.include_router(catatan_meter.router, prefix="/api")
app.include_router(tagihan.router, prefix="/api")
app.include_router(kas.router, prefix="/api")
app.include_router(audit_air.router, prefix="/api")
app.include_router(public_portal.router, prefix="/api")


@app.get("/")
def root():
    return {
        "app": "TirtaDesa API",
        "version": "1.0.0",
        "tagline": "Air Mengalir Rapi, Kas Transparan",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "TirtaDesa"}

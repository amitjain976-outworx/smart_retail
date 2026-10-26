from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from db.database import engine, Base
from routes.auth import router as auth_router
from routes.admin import router as admin_router
from routes.layout import router as layout_router
from routes.cashier import router as cashier_router


# ==========================================================
# APPLICATION LIFECYCLE
# ==========================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown events.
    """

    try:
        # --------------------------------------------------
        # Create tables (Development Only)
        # --------------------------------------------------
        Base.metadata.create_all(bind=engine)

        # --------------------------------------------------
        # Test Database Connection
        # --------------------------------------------------
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        print("=" * 60)
        print(" Smart Retail Backend Started Successfully")
        print(" Database Connected Successfully")
        print("=" * 60)

    except Exception as e:
        print("=" * 60)
        print(" Failed to connect to database")
        print(e)
        print("=" * 60)
        raise

    yield

    print("Smart Retail Backend Shutdown")


# ==========================================================
# FASTAPI APP
# ==========================================================

app = FastAPI(
    title="Smart Retail Management API",
    description="Backend APIs for Smart Retail Management System",
    version="1.0.0",
    lifespan=lifespan,
)


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # React (CRA)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# ROUTERS
# ==========================================================

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(layout_router)
app.include_router(cashier_router)

# ==========================================================
# ROOT
# ==========================================================

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Smart Retail Management API",
        "status": "Running",
        "version": "1.0.0"
    }


# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.get("/health", tags=["Health"])
def health():
    """
    Health check endpoint.
    """

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
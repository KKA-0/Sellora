import os
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Sellora API",
    version="0.1.0",
    description="Backend API for Sellora Multi-Channel E-Commerce & GST Engine"
)

# Enable CORS for Tauri desktop client and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:1420",
        "http://127.0.0.1:1420",
        "http://localhost:5173",
        "tauri://localhost",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str


@app.get("/", response_model=HealthResponse)
@app.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint to verify API server is active."""
    return HealthResponse(
        status="healthy",
        app="Sellora API",
        version="0.1.0"
    )


# --- Overview & Analytics ---
@app.get("/api/overview")
def get_overview_metrics(
    channel: Optional[str] = "All",
    period: Optional[str] = "this_month"
):
    """Returns aggregated gross sales, net settlements, returns, and net profit metrics."""
    # Channel weighting
    ch_multiplier = 1.0
    if channel == "Amazon":
        ch_multiplier = 0.52
    elif channel == "Flipkart":
        ch_multiplier = 0.33
    elif channel == "Meesho":
        ch_multiplier = 0.15

    base_gross = 482450
    if period == "today":
        base_gross = 18950
    elif period == "7d":
        base_gross = 124600
    elif period == "last_month":
        base_gross = 412800

    gross_sales = round(base_gross * ch_multiplier)
    marketplace_fees = round(gross_sales * 0.235)
    cogs = round(gross_sales * 0.397)
    net_profit = gross_sales - marketplace_fees - cogs
    net_profit_margin = round((net_profit / gross_sales) * 100, 1) if gross_sales else 0.0
    net_settlement = gross_sales - marketplace_fees
    gst_liability = round(gross_sales * 0.071)

    return {
        "channel": channel,
        "period": period,
        "gross_sales": gross_sales,
        "marketplace_fees": marketplace_fees,
        "cogs": cogs,
        "net_profit": net_profit,
        "net_profit_margin_pct": net_profit_margin,
        "net_settlement": net_settlement,
        "gst_liability": gst_liability,
        "return_rate_pct": 11.8,
    }


# --- Inventory Endpoints ---
class InventoryItemSchema(BaseModel):
    sku: str
    title: str
    channel: str
    stock: int
    listing_price: float
    seller_price: float
    hsn: Optional[str] = None
    gst_rate: Optional[float] = 18.0


@app.post("/api/inventory/upload")
async def upload_inventory_sheet(file: UploadFile = File(...)):
    """Upload and parse an inventory/catalog spreadsheet (.csv, .xlsx)."""
    filename = file.filename or ""
    if not (filename.endswith(".csv") or filename.endswith(".xlsx") or filename.endswith(".tsv")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload .csv, .tsv or .xlsx."
        )

    content = await file.read()
    return {
        "filename": filename,
        "bytes_received": len(content),
        "message": f"Successfully received {filename} for parsing."
    }


# --- Settlements & GST Endpoints ---
@app.get("/api/gst/status")
def get_gst_filing_status():
    """Returns upcoming GSTR-1 and GSTR-3B compliance filing deadlines."""
    return {
        "gstr1_due_day": 11,
        "gstr3b_due_day": 20,
        "status": "ready_for_generation",
        "pending_invoices_count": 142
    }


def main():
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)


if __name__ == "__main__":
    main()

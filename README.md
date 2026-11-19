# Sellora

> **The Smart Multi-Channel E-Commerce & GST Operating System for Indian Sellers**  
> Built for sellers operating across **Amazon.in**, **Flipkart**, and **Meesho**.

Sellora is a local-first desktop application engineered to give Indian e-commerce merchants total clarity over their actual in-pocket profit margins, inventory levels, reverse shipping leakages, and government tax compliance. Built with a hybrid local-plus-cloud architecture, Sellora guarantees 100% data privacy by keeping financial records on your machine while providing optional cloud synchronization and AI audits.

---

## ⚡ Quick Start

You can run both the **FastAPI Backend** and the **Sellora Desktop Application** concurrently with a single command:

```bash
# Start both Backend (Port 8000) and Desktop Client (Tauri v2)
./start.sh
# or
./dev.sh
```

### Run Options:
| Command | Mode | Description |
| :--- | :--- | :--- |
| `./start.sh` | **Desktop (Tauri v2)** | Starts FastAPI and launches the native macOS/Windows desktop window. |
| `./start.sh --web` | **Web UI (Vite)** | Starts FastAPI and opens the client in browser mode at `http://localhost:1420`. |

> **Graceful Shutdown**: Pressing `Ctrl + C` automatically terminates both services and frees all ports.

---

## 🧭 Key Features & Architecture

### 1. Dual-Mode Workspace Gateway
- **Offline / Local-First Mode**: Zero account setup, no cloud lock-in. All catalogs, costs, and invoices are stored locally on your SSD via SQLite.
- **Cloud Sync Mode**: Login / Sign Up with end-to-end encrypted backup, multi-device synchronization, and automated tax deadline alerts.
- Configurable Store Name, State (for GST jurisdiction), and sales channel toggles.

### 2. Financial Overview & Real-Time Profit Engine
- **Dedicated Total Net Profit Block**:
  - Highlights true **In-Hand Realized Net Profit (₹)** and net profit margin percentage.
  - Transparent **4-Step Deduction Formula**:
    $$\text{Net Profit} = \text{Gross Revenue} - \text{Platform \& Courier Fees} - \text{Product COGS}$$
- **Interactive Date Filters**: Filter metrics dynamically by **Today**, **Last 7 Days**, **This Month**, **Last Month**, or **Custom Range**.
- **Multi-Channel Filters**: Isolate or aggregate metrics across **Amazon**, **Flipkart**, and **Meesho**.

### 3. Inventory & Catalog Manager
- **File Upload & Smart Column Mapping**: Ingest catalog files (`.csv`, `.tsv`, `.txt`, `.xlsx`) with auto-detected headers.
- **Interactive Column Mapper**: Match custom CSV columns to SKU, Title, Stock, Listing Price, and Seller Purchase Cost (COGS).
- **Inline Editing**: Live editable Stock counts, Cost Price, and Listing Price with instant margin recalculation.
- **Valuation Metrics**: Real-time capital invested (Cost valuation), retail inventory valuation, and low stock warnings (< 10 units).
- **Sample Template**: Built-in downloadable CSV template (`sellora_inventory_template.csv`).

### 4. Orders & Shipments
- Comprehensive order ledger tracking Order ID, Date, Channel, SKU, Quantity, Order Value (₹), Destination State, and Fulfillment Status (*Delivered*, *Shipped*, *Returns*, *Cancelled*).
- Filter orders by marketplace channel or fulfillment stage.

### 5. Dedicated Returns & RTO Tracker
- **Courier RTO vs. Customer Returns**: Distinguishes between doorstep rejections (RTO) and post-delivery customer return requests.
- **Reverse Shipping Leakage Monitoring**: Tracks courier freight deductions and penalty charges on returned orders.
- **Warehouse Verification Workflow**:
  - `Mark Received`: Stage items arriving back at the warehouse.
  - `Verify & Restock`: Automatically return healthy, undamaged items back to inventory.
  - `File Dispute / Claim`: Integrated claim logger for **Amazon SAFE-T Claims**, **Flipkart SPF (Seller Protection Fund)**, and **Meesho Dispute Tickets** with damage notes and claim reimbursement tracking.

### 6. Minimalist White UI & Collapsible Navigation
- Distraction-free, clean white aesthetic with subtle 1px borders and high-contrast typography.
- **Collapsible Sidebar**: Easily toggle between full-width (`w-56`) and compact icon-only (`w-16`) modes to maximize screen space for large tables. Preference is persisted locally.

### 7. FastAPI Backend Microservice
- Modern Python backend powered by **FastAPI**, **Uvicorn**, **UV**, and **Pandas**.
- Out-of-the-box CORS middleware configured for desktop apps (`localhost:1420` and `tauri://localhost`).
- Interactive Swagger API docs available at `http://127.0.0.1:8000/docs`.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Desktop App** | [Tauri v2](https://tauri.app/) (Rust 2024 edition) |
| **Frontend Framework** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 8](https://vite.dev/) |
| **Styling & Icons** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Data Parsing** | [PapaParse](https://www.papaparse.com/), Pandas, OpenPyXL |
| **Backend API** | [Python 3.12](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), [uv](https://astral.sh/uv) |
| **Cloud (Target)** | AWS Serverless (Cognito, Lambda, DynamoDB, S3) |

---

## 📂 Project Structure

```text
Sellora/
├── start.sh              # Unified orchestrator (starts API + desktop frontend)
├── dev.sh                # Symlink to start.sh
├── README.md             # Project documentation
├── api/                  # Python FastAPI Backend
│   ├── main.py           # FastAPI app instance, endpoints & CORS config
│   ├── pyproject.toml    # Dependencies (FastAPI, Pandas, OpenPyXL, etc.)
│   └── .python-version   # Python 3.12 target version
├── sellora/              # Tauri Desktop Application
│   ├── index.html        # App HTML shell
│   ├── package.json      # React 19, Tailwind v4, Vite 8 dependencies
│   ├── src/              # React frontend application
│   │   ├── App.tsx       # Root view router & session manager
│   │   ├── types/        # TypeScript interfaces (Workspace, Inventory, Orders)
│   │   └── components/
│   │       ├── AuthGateway.tsx   # Offline vs Cloud starting screen
│   │       ├── Dashboard.tsx     # Overview, date filters, net profit block & sidebar
│   │       ├── InventoryView.tsx # Catalog manager & CSV upload/mapping
│   │       └── OrdersView.tsx    # Orders & Returns/RTO tracker
│   └── src-tauri/        # Rust desktop wrapper & native configuration
└── infra/                # Cloud infrastructure definitions (IaC)
```

---

## 💻 Manual Setup

If you prefer to run services individually in separate terminal windows:

### 1. Backend Service
```bash
cd api
uv run uvicorn main:app --reload --port 8000
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

### 2. Desktop Client
```bash
cd sellora
npm install
npm run tauri dev
```
To run only the web interface in your browser:
```bash
npm run dev
```

---

## 📜 License
MIT License. See [LICENSE](file:///Users/karanagarwal/Documents/projects/Sellora/LICENSE) for details.

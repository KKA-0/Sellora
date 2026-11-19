# Sellora

An AI-powered, local-first desktop application designed for Indian e-commerce sellers (operating across Amazon, Flipkart, and Meesho) to automate inventory tracking, multi-channel profit and loss (P&L) analytics, compliance reminders, and monthly GST portal JSON generation. Built with a hybrid local-plus-serverless architecture.

---

## Quick Start (Runs Desktop App & FastAPI Backend)

To launch both the **FastAPI Backend** (`http://127.0.0.1:8000`) and the **Sellora Desktop Application** concurrently with a single command:

```bash
./start.sh
# or
./dev.sh
```

### Options:
- **Desktop Mode (Tauri v2)**: `./start.sh` (default)
- **Web Browser Mode (Vite)**: `./start.sh --web`

Pressing `Ctrl + C` will cleanly stop both services and free all ports automatically.

---

## Project Structure

- `sellora/`: Tauri v2 desktop application (React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons).
- `api/`: Python backend API powered by FastAPI, Uvicorn, UV, and Pandas.
- `infra/`: Cloud infrastructure definitions.
- `start.sh`: Unified startup orchestrator for local development.

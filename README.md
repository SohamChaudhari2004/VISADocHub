# DocHub - Visa Application System

![DocHub Screenshot](./WhatsApp%20Image%202026-01-31%20at%2012.53.52%20PM.jpeg)

DocHub is an intelligent application and document management system specializing in automating complex U.S. Visa workflows.

## 🚀 Key Features

- **Dynamic Visa Workflows:** Select your Visa type (F-1, H-1B, B-1/B-2, or J-1) and the system automatically updates the exact document requirements you need.
- **Intelligent DS-160 Dashboard:** A clean, guided React step-wizard that captures all intensive data needed for the United States DS-160 program.
- **Pixel-Perfect PDF Export:** A `PyMuPDF` Python engine dynamically calculates the exact X/Y coordinate bounding boxes of the official DS-160 document, flawlessly stamping the user's data natively onto the page.
- **Overflow Handling:** Answers that do not fit into the core PDF are programmatically aggregated and appended into a clean "Additional Application Data" page linked at the end of the document.

## 💻 Tech Stack

- **Frontend:** Next.js (React), TailwindCSS, Radix UI Components (`shadcn/ui`)
- **Backend:** Python FastAPI, PyMuPDF (`fitz`), SQLAlchemy, SQLite
- **Architecture:** Decoupled REST API with automatic Swagger docs.

## 🛠️ Getting Started

### Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (Windows)
4. `pip install -r requirements.txt`
5. `uvicorn main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

Navigate to `http://localhost:3000` to start your application dashboard!

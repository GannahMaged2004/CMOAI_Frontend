# CMO.ai - AI-Powered Chief Marketing Officer Backend 🚀

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)

An intelligent, API-driven backend for **CMO.ai**, an automated platform designed to act as your artificial intelligence marketing co-pilot. Built with top-tier modern Python practices, this backend is meant to be highly scalable, completely asynchronous where possible, and secure.

## 🌟 Features

* **JWT Authentication:** Complete user registration, login, and token-refresh flows securely built with `passlib` and `jose`.
* **Database Management:** Uses **SQLAlchemy 2.0** ORM for robust data modeling and **Alembic** for seamless schema migrations.
* **RESTful API Architecture:** Modularized code separated by domain (Auth, Users, Teams, Brands, Strategies, etc.).
* **Robust Validation:** All payloads are strictly validated using **Pydantic** models.
* **Auto-generated Documentation:** The Swagger UI (`/docs`) and Redoc UI (`/redoc`) make testing APIs a breeze.

---

## 🛠️ Tech Stack

* **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
* **Database:** PostgreSQL
* **ORM:** [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
* **Migrations:** [Alembic](https://alembic.sqlalchemy.org/en/latest/)
* **Data Validation:** Pydantic
* **Authentication:** OAuth2 with Password Flow (JWT)
* **Server:** Uvicorn

---

## 📂 Project Structure

```text
d:\CMO.ai\
├── alembic/              # Database migration scripts and configurations
├── app/                  # Main application package
│   ├── api/v1/           # API Routers for endpoints (auth, teams, brands, etc.)
│   ├── core/             # Core configurations, security, and exception handling
│   ├── db/               # Database session management
│   ├── models/           # SQLAlchemy ORM database models
│   ├── schemas/          # Pydantic schemas for data validation
│   └── services/         # Core business logic separated from routing
├── .env                  # Environment variables
├── alembic.ini           # Alembic configuration
├── main.py               # FastAPI application entry point
└── requirements.txt      # Python dependencies
```

---

## ⚙️ Prerequisites

Before you start, make sure you have the following installed:
* Python 3.10+
* PostgreSQL (Running locally or hosted)

---

## 🚀 Installation & Setup

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/CMO-backend.git
cd CMO-backend
```

**2. Create a Virtual Environment**
```bash
python -m venv venv
```

**3. Activate the Virtual Environment**
* **Windows:**
  ```bash
  .\venv\Scripts\activate
  ```
* **macOS / Linux:**
  ```bash
  source venv/bin/activate
  ```

**4. Install Dependencies**
```bash
pip install -r requirements.txt
```

**5. Configure Environment Variables**
Create your `.env` file in the root directory and ensure you have the following variables (modify them for your setup):
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost/cmo_db

# Security
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 💾 Database Setup & Migrations

To sync your database tables with the SQLAlchemy models using Alembic, run:

```bash
# Apply all new database migrations
alembic upgrade head
```

*(Note: To generate a new migration after making changes to your `models/`, run: `alembic revision --autogenerate -m "description"`)*

---

## 🏃 Running the Application

Ensure your virtual environment is active, then run:

```bash
uvicorn app.main:app --reload
```

The application will be accessible at:
* **API Endpoints:** `http://localhost:8000/api/v1`
* **Swagger UI (Docs):** `http://localhost:8000/docs`
* **Redoc UI:** `http://localhost:8000/redoc`

---

## 🔐 How to Authenticate via Swagger UI

To interact with protected endpoints directly in the browser:
1. Navigate to the `http://localhost:8000/docs`.
2. Scroll to `POST /api/v1/auth/register` and register a new user.
3. Scroll to the top of the documentation and click the green **Authorize** padlock button.
4. Input the email and password you just used to register.
5. Swagger will automatically attach your Bearer token to all future requests!
# 🎓 Web-Based Learning Management System (LMS)

This project is a comprehensive **Database Management System** application designed to digitize university academic workflows, including course registration, grading, assignment submissions, and announcements.

Built on modern web architecture, the application delegates a significant portion of its core business logic directly to the database layer via **Stored Procedures** and **Triggers**.

---

## 🚀 Features

- **Role-Based Access Control (RBAC):** Tailored interfaces and permission boundaries for Administrators, Faculty, and Students.
- **Faculty Portal:** Course management, assignment creation, grade entry, and announcement publishing.
- **Student Portal:** Course registration, assignment file uploads, grade tracking, and transcript viewing.
- **Advanced Database Architecture:**
  - Complete CRUD operations encapsulated inside **Stored Procedures**.
  - Business rules and data integrity enforced through **Triggers**.
  - Optimized queries and reporting powered by complex relational **JOIN** operations.

---

## 🛠️ Tech Stack

- **Backend:** Python (FastAPI)
- **Frontend:** React.js (Vite)
- **Database:** MySQL
- **Data Communication:** REST API (Axios)

---

## ⚙️ Setup and Installation

Follow the steps below to run the project locally.

### 1. Database Setup
1. Create a MySQL database named `ogrenci_lms`.
2. Import the SQL initialization scripts in the following order:
   - `setup.sql` (Schema and Tables)
   - `procedures.sql` (Stored Procedures)
   - `dummy_data.sql` (Mock Data)

### 2. Backend Setup
```bash
# Install required Python dependencies
pip install fastapi uvicorn mysql-connector-python python-multipart

# Start the API server
python main.py
```

### 3. Frontend Setup
```bash
cd src

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

---

## 🔑 Test Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@gmail.com` | `12345` |
| **Faculty** | `ahmet.hoca@uni.edu.tr` | `12345` |
| **Student** | `ogrenci1@gmail.com` | `12345` |

# 🏥 CareFlow – Hospital Management System

## 📌 Overview
CareFlow is a full-stack Hospital Management System designed to streamline healthcare operations including patient management, doctor scheduling, appointment booking, billing, and prescription tracking.

The system supports multiple user roles (Admin, Doctor, Patient) with role-based access control and provides a centralized platform for managing hospital workflows efficiently.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Secure login and registration
- Role-based access control (Admin, Doctor, Patient)
- Middleware-based route protection

### 👤 Patient Module
- Patient registration and login
- Book appointments with doctors
- View appointment history
- Access prescriptions

### 👨‍⚕️ Doctor Module
- View assigned appointments
- Manage patient records
- Add prescriptions
- Update appointment status

### 🛠️ Admin Module
- Manage doctors and patients
- View system-wide data
- Monitor appointments and billing

### 📅 Appointment Management
- Book appointments
- Schedule handling
- Doctor-patient linking

### 💊 Prescription System
- Doctors can create prescriptions
- Linked to patients and appointments
- Maintains medical history

### 💰 Billing System
- Generate bills for appointments
- Track payments and records

---

## 🏗️ Tech Stack

### Frontend:
- React (Vite)
- HTML, CSS, JavaScript

### Backend:
- Node.js
- Express.js

### Database:
- MongoDB

### Other Tools:
- JWT / Authentication Middleware
- REST APIs

---

## 📁 Project Structure
backend/
├── src/
│ ├── controllers/
│ ├── middleware/
│ ├── config/
│ ├── app.js
│
├── server.js
├── package.json

frontend/
├── src/
│ ├── components/
│ ├── pages/
│ ├── services/
│
├── index.html


---

## ⚙️ How It Works

1. User logs in based on role
2. Requests are sent to backend APIs
3. Backend processes data via controllers
4. Database stores/retrieves information
5. Response sent back to frontend

---

## 🔄 System Flow

---

## 🔐 Security Features
- Protected routes using middleware
- Basic authentication system
- Role-based restrictions

---

## ⚠️ Limitations
- No payment gateway integration
- Basic security (no rate limiting / refresh tokens)
- Limited scalability

---

## 🔮 Future Improvements
- Advanced scheduling system
- Notifications (Email/SMS)
- Microservices architecture for scalability
- AI-based health recommendations

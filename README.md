# Hospital Management System (MERN)

This project is implemented from the provided PDF using a three-tier architecture:
- Frontend: React (Vite) + Axios + React Router
- Backend: Node.js + Express + JWT + bcrypt
- Database: MongoDB + Mongoose

## Modules Included
- Authentication (Signup/Login/JWT)
- Roles: patient, doctor, admin
- Patient profile and medical history
- Doctor scheduling and patient record access
- Appointment booking and status updates
- Prescription management
- Billing generation and payment tracking
- Admin dashboard stats and management tables

## Folder Structure
- `frontend/` React app
- `backend/` Express API

## Backend Setup
1. Open terminal in `backend`.
2. Copy `.env.example` to `.env` and set values.
3. Run:
   - `npm install`
   - `npm run dev`

Example `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hms_db
JWT_SECRET=replace_with_secure_secret
```

## Frontend Setup
1. Open terminal in `frontend`.
2. Copy `.env.example` to `.env`.
3. Run:
   - `npm install`
   - `npm run dev`

Example `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## Flow Coverage from PDF
1. User registration (patient/doctor/admin)
2. JWT authentication
3. Doctor scheduling (availability)
4. Appointment booking
5. Consultation and prescription updates
6. Billing management
7. Record maintenance (MongoDB)

## Login Flow
- Patient and doctor accounts are created through the public signup page.
- Admin accounts are not available in public signup.
- Admin login uses the dedicated admin portal and the credentials from backend `.env`:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
- On server startup, the admin user is seeded into the `users` collection if it does not already exist.

## Where Data Is Stored
- `users`: all accounts with role `patient`, `doctor`, or `admin`
- `patients`: patient profile and medical history
- `doctors`: doctor specialization and availability
- `appointments`: bookings and statuses
- `prescriptions`: medicines and consultation notes
- `billing`: bill amount and payment status

## Where To See Users
- MongoDB Atlas: open your cluster, then browse the `hms_db` database and the `users` collection.
- MongoDB Compass: connect with the same Atlas URI and inspect the collections directly.

## Suggested Quick Test
1. Register doctor account.
2. Register patient account.
3. Doctor login and set availability.
4. Patient login and book appointment.
5. Doctor confirms/completes appointment and adds prescription.
6. Register admin account.
7. Admin generates bill and updates payment status.

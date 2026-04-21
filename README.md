# Healthcare Platform — Microservices Backend

> SE3020 Distributed Systems · Assignment 1  
> AI-Enabled Smart Healthcare Appointment & Telemedicine Platform

---

## Architecture Overview

```
Client (Browser / Mobile)
        │
        ▼
  ┌─────────────┐
  │ API Gateway │  :3000  — JWT validation, route forwarding
  └──────┬──────┘
         │
   ┌─────┼──────────────────────┐
   ▼     ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────────┐
│ user-identity    │  │ clinical-medical      │  │ appointment-video    │  │ transaction-notify       │
│ service :3001    │  │ service :3002         │  │ service :3003        │  │ service :3004            │
│                  │  │                       │  │                      │  │                          │
│ • Register/Login │  │ • Upload medical docs │  │ • Book appointments  │  │ • Stripe payments        │
│ • Patient profile│  │ • View medical history│  │ • Accept/Reject      │  │ • Stripe webhooks        │
│ • Doctor profile │  │ • Issue prescriptions │  │ • Jitsi video session│  │ • Email (nodemailer)     │
│ • Availability   │  │ • View prescriptions  │  │ • Session start/end  │  │ • SMS (Twilio)           │
│ • Admin controls │  │                       │  │                      │  │ • In-app notifications   │
└──────┬───────────┘  └──────────┬────────────┘  └──────────┬───────────┘  └──────────────────────────┘
       │                         │                           │
  ┌────▼────┐              ┌─────▼─────┐             ┌──────▼──────┐             ┌─────────────────┐
  │ MongoDB │              │  MongoDB  │             │   MongoDB   │             │    MongoDB      │
  │  :user  │              │ :clinical │             │ :appointment│             │  :transaction   │
  └─────────┘              └───────────┘             └─────────────┘             └─────────────────┘
```

---

## Service Responsibilities

| Service | Port | Responsibility |
|---|---|---|
| `api-gateway` | 3000 | JWT auth, request routing to all services |
| `user-identity-service` | 3001 | Auth (register/login), patient & doctor profiles, admin controls |
| `clinical-medical-service` | 3002 | Medical record uploads, prescriptions, medical history |
| `appointment-video-service` | 3003 | Appointment CRUD, Jitsi video session management |
| `transaction-notify-service` | 3004 | Stripe payments, email/SMS/in-app notifications |

---

## Quick Start — Docker Compose (Recommended)

### Prerequisites
- Docker Desktop (or Docker Engine + Compose plugin)
- Git

### Steps

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd services/

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your real Stripe, SMTP, Twilio keys

# 3. Build and start all services
docker compose up --build

# 4. Verify all services are healthy
curl http://localhost:3000/health
curl http://localhost:3000/api/doctors/public
```

All requests go through **port 3000** (the API Gateway).

---

## Quick Start — Run Services Locally (Without Docker)

> Requires Node.js 20+ and MongoDB running locally.

```bash
# Terminal 1 — user-identity-service
cd services/user-identity-service
cp .env.example .env   # set MONGO_URI=mongodb://localhost:27017/user-identity-db
npm install && npm run dev

# Terminal 2 — clinical-medical-service
cd services/clinical-medical-service
cp .env.example .env
npm install && npm run dev

# Terminal 3 — appointment-video-service
cd services/appointment-video-service
cp .env.example .env
npm install && npm run dev

# Terminal 4 — transaction-notify-service
cd services/transaction-notify-service
cp .env.example .env   # set your Stripe / SMTP / Twilio keys
npm install && npm run dev

# Terminal 5 — api-gateway
cd services/api-gateway
cp .env.example .env   # set all SERVICE_URL vars to http://localhost:300x
npm install && npm run dev
```

For local mode, update `api-gateway/.env`:
```
USER_IDENTITY_SERVICE_URL=http://localhost:3001
CLINICAL_MEDICAL_SERVICE_URL=http://localhost:3002
APPOINTMENT_VIDEO_SERVICE_URL=http://localhost:3003
TRANSACTION_NOTIFY_SERVICE_URL=http://localhost:3004
```

---

## API Reference

All requests go to `http://localhost:3000`. Protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Authentication (Public)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register patient or doctor |
| `POST` | `/api/auth/login` | Login — returns JWT |

**Register body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "patient",
  "phone": "+94771234567"
}
```

**Doctor registration** (add these extra fields):
```json
{
  "role": "doctor",
  "specialization": "Cardiology",
  "licenseNumber": "MD-12345",
  "experience": 10,
  "consultationFee": 2500
}
```

---

### User / Doctor Management

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Any | Get own profile |
| `PUT` | `/api/users/me` | Any | Update own profile |
| `GET` | `/api/doctors/public` | Public | List verified doctors (filter: `?specialization=cardiology`) |
| `GET` | `/api/doctors/:id` | Any | Get doctor by ID |
| `PUT` | `/api/doctors/availability` | Doctor | Set weekly availability schedule |

**Set availability body:**
```json
{
  "availability": [
    { "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": 3, "startTime": "09:00", "endTime": "17:00" }
  ]
}
```

---

### Admin Controls

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/admin/users` | Admin | List all users (filter: `?role=doctor`) |
| `PATCH` | `/api/admin/doctors/:id/verify` | Admin | Verify a doctor registration |
| `PATCH` | `/api/admin/users/:id/status` | Admin | Activate/deactivate user |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete user account |

---

### Medical Records

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/records/upload` | Patient, Doctor | Upload a medical document (multipart/form-data, field: `file`) |
| `GET` | `/api/records` | Any | Get records (patient: own; doctor: `?patientId=xxx`) |
| `GET` | `/api/records/:id` | Any | Get single record |
| `DELETE` | `/api/records/:id` | Patient, Admin | Delete a record |

**Upload form fields:** `file` (binary), `title`, `description`, `recordType`  
**recordType options:** `lab_report`, `imaging`, `prescription`, `consultation_note`, `uploaded_document`, `other`

---

### Prescriptions

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/prescriptions` | Doctor | Issue a digital prescription |
| `GET` | `/api/prescriptions` | Any | List prescriptions (scoped by role) |
| `GET` | `/api/prescriptions/:id` | Any | Get single prescription |

**Issue prescription body:**
```json
{
  "patientId": "patient_mongo_id",
  "appointmentId": "appt_mongo_id",
  "diagnosis": "Hypertension",
  "medications": [
    {
      "name": "Amlodipine",
      "dosage": "5mg",
      "frequency": "Once daily",
      "duration": "30 days",
      "instructions": "Take in the morning with food"
    }
  ],
  "notes": "Follow up in 4 weeks",
  "followUpDate": "2026-05-18"
}
```

---

### Appointments

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/appointments` | Patient | Book an appointment |
| `GET` | `/api/appointments` | Any | List appointments (scoped by role; filter: `?status=pending`) |
| `GET` | `/api/appointments/:id` | Any | Get single appointment |
| `PATCH` | `/api/appointments/:id/status` | Doctor/Patient/Admin | Update status |
| `DELETE` | `/api/appointments/:id` | Patient, Admin | Cancel appointment |

**Book appointment body:**
```json
{
  "doctorId": "doctor_mongo_id",
  "appointmentDate": "2026-05-01",
  "startTime": "10:00",
  "endTime": "10:30",
  "specialization": "Cardiology",
  "reasonForVisit": "Chest pain checkup",
  "consultationType": "video"
}
```

**Update status body (doctor):**
```json
{ "status": "confirmed" }
```

**Cancel body (patient):**
```json
{ "cancellationReason": "Schedule conflict" }
```

---

### Video Sessions (Telemedicine — Jitsi Meet)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/sessions/start/:appointmentId` | Doctor | Generate Jitsi room & session URL |
| `GET` | `/api/sessions/join/:appointmentId` | Patient, Doctor | Get the session join URL |
| `POST` | `/api/sessions/end/:appointmentId` | Doctor | End session, mark appointment completed |

The session URL is a standard Jitsi Meet room link (e.g. `https://meet.jit.si/healthcare-<id>-<uuid>`).  
Both patient and doctor open this URL in their browser — no plugin required.

---

### Payments (Stripe)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/payments/create-intent` | Patient | Create Stripe PaymentIntent, returns `clientSecret` |
| `POST` | `/api/payments/confirm/:paymentId` | Patient | Sync payment status from Stripe |
| `GET` | `/api/payments` | Any | List payments (scoped by role) |
| `GET` | `/api/payments/:id` | Any | Get single payment |
| `POST` | `/api/payments/refund/:id` | Admin | Refund a succeeded payment |
| `POST` | `/api/payments/webhook` | Stripe | Stripe webhook (register in Stripe dashboard) |

**Create intent body:**
```json
{
  "appointmentId": "appt_mongo_id",
  "doctorId": "doctor_mongo_id",
  "amount": 250000,
  "currency": "usd",
  "description": "Cardiology consultation"
}
```
> Amount is in **cents** (250000 = $2500.00).

Use the returned `clientSecret` with [Stripe.js](https://stripe.js.com) on the frontend to complete payment.

---

### Notifications

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Any | Get own notifications (`?unreadOnly=true`) |
| `PATCH` | `/api/notifications/:id/read` | Any | Mark single notification as read |
| `PATCH` | `/api/notifications/read-all` | Any | Mark all as read |

Notifications are created automatically on key events (appointment booked, status changed, payment success/fail).

---

## Roles & Permissions Summary

| Feature | Patient | Doctor | Admin |
|---|:---:|:---:|:---:|
| Register / Login | ✅ | ✅ | — |
| Manage own profile | ✅ | ✅ | — |
| Browse doctors | ✅ | — | — |
| Book appointments | ✅ | — | — |
| Accept/Reject appointments | — | ✅ | — |
| Upload medical reports | ✅ | ✅ | — |
| View own medical history | ✅ | — | — |
| View patient records | — | ✅ | ✅ |
| Issue prescriptions | — | ✅ | — |
| View prescriptions | ✅ | ✅ | ✅ |
| Start/End video session | — | ✅ | — |
| Join video session | ✅ | ✅ | — |
| Make payments | ✅ | — | — |
| View own payments | ✅ | ✅ | ✅ |
| Refund payments | — | — | ✅ |
| Manage all users | — | — | ✅ |
| Verify doctor registrations | — | — | ✅ |
| View all notifications | Own | Own | All |

---

## Technology Stack

| Concern | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT (jsonwebtoken + bcryptjs) |
| Containerisation | Docker + Docker Compose |
| Video Consultation | Jitsi Meet (meet.jit.si) |
| Payments | Stripe (sandbox) |
| Email | Nodemailer (SMTP / Mailtrap) |
| SMS | Twilio |
| File Uploads | Multer |

---

## Environment Variables Reference

### api-gateway
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `JWT_SECRET` | Shared secret for JWT validation |
| `USER_IDENTITY_SERVICE_URL` | URL of user-identity-service |
| `CLINICAL_MEDICAL_SERVICE_URL` | URL of clinical-medical-service |
| `APPOINTMENT_VIDEO_SERVICE_URL` | URL of appointment-video-service |
| `TRANSACTION_NOTIFY_SERVICE_URL` | URL of transaction-notify-service |

### transaction-notify-service (additional)
| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `SMTP_HOST/PORT/USER/PASS` | SMTP credentials for email |
| `TWILIO_ACCOUNT_SID/AUTH_TOKEN/PHONE_NUMBER` | Twilio credentials for SMS |

---

## Stripe Webhook Setup (Local Dev)

Use the Stripe CLI to forward webhooks to your local service:

```bash
stripe listen --forward-to http://localhost:3000/api/payments/webhook
```

Copy the `whsec_...` secret printed and set it as `STRIPE_WEBHOOK_SECRET`.

---

## Folder Structure

```
services/
├── docker-compose.yml
├── .env.example
├── api-gateway/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── index.js
│       └── middleware/
│           └── auth.js
├── user-identity-service/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/db.js
│       ├── middleware/roleCheck.js
│       ├── models/User.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── userController.js
│       │   └── adminController.js
│       └── routes/index.js
├── clinical-medical-service/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/{db.js,upload.js}
│       ├── middleware/roleCheck.js
│       ├── models/{MedicalRecord.js,Prescription.js}
│       ├── controllers/
│       │   ├── recordController.js
│       │   └── prescriptionController.js
│       └── routes/index.js
├── appointment-video-service/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/db.js
│       ├── middleware/roleCheck.js
│       ├── models/Appointment.js
│       ├── controllers/
│       │   ├── appointmentController.js
│       │   └── sessionController.js
│       └── routes/index.js
└── transaction-notify-service/
    ├── Dockerfile
    ├── .env.example
    ├── package.json
    └── src/
        ├── index.js
        ├── config/{db.js,stripe.js,mailer.js,sms.js}
        ├── middleware/roleCheck.js
        ├── models/{Payment.js,Notification.js}
        ├── controllers/
        │   ├── paymentController.js
        │   └── notificationController.js
        └── routes/index.js
```

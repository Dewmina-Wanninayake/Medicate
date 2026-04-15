===============================================================================
 Medicate Smart Healthcare Platform
 Member 4 — Infrastructure, Security & Transactions
 transaction-notify-service  |  readme.txt
===============================================================================

TABLE OF CONTENTS
-----------------
 1. Service Overview
 2. Project Structure
 3. Authentication & Security Mechanism
 4. Payment Integration (Stripe)
    4a. Stripe Setup
    4b. Payment Flow
    4c. Webhooks
    4d. Refunds
 5. Notification Integration
    5a. Email (Nodemailer/SMTP)
    5b. SMS (Twilio)
 6. Environment Variables Setup
 7. Local Development
 8. Docker Setup
 9. Kubernetes Deployment Steps
10. API Reference Summary
11. Security Checklist


===============================================================================
 1. SERVICE OVERVIEW
===============================================================================

The `transaction-notify-service` is a Node.js/Express microservice responsible
for two core concerns of the Medicate platform:

  TRANSACTIONS (Stripe):
    - Accept credit/debit card payments from patients for doctor consultations
    - Create and confirm Stripe PaymentIntents
    - Issue full and partial refunds via the Stripe API
    - Process real-time payment events via Stripe webhooks
    - Persist full transaction lifecycle in MongoDB

  NOTIFICATIONS:
    - Email receipts and alerts via SMTP (Nodemailer)
    - SMS notifications via Twilio
    - Payment confirmations, appointment reminders, refunds, OTPs
    - Stores complete notification delivery history in MongoDB

Port: 3003


===============================================================================
 2. PROJECT STRUCTURE
===============================================================================

transaction-notify-service/
├── src/
│   ├── index.js                       ← Server entry point (starts on port 3003)
│   ├── app.js                         ← Express factory (middleware, DB, routes)
│   │
│   ├── middleware/
│   │   ├── auth.js                    ← JWT verification + role-based access control
│   │   └── validate.js                ← express-validator error response helper
│   │
│   ├── models/
│   │   ├── Transaction.js             ← MongoDB schema for Stripe transactions
│   │   └── Notification.js            ← MongoDB schema for email/SMS history
│   │
│   ├── services/
│   │   ├── stripe.service.js          ← Stripe SDK wrapper (intents, refunds, customers)
│   │   ├── email.service.js           ← Nodemailer + 5 HTML email templates
│   │   └── sms.service.js             ← Twilio + 7 SMS message templates
│   │
│   ├── controllers/
│   │   ├── payment.controller.js      ← Stripe payment logic + notifications
│   │   └── notification.controller.js ← Manual notification dispatch + history
│   │
│   └── routes/
│       ├── payment.routes.js          ← /api/payments/* routes
│       ├── notification.routes.js     ← /api/notifications/* routes
│       └── webhook.routes.js          ← /api/webhooks/stripe (raw body)
│
├── .env.example                       ← Environment variable template
├── .gitignore
├── Dockerfile                         ← Multi-stage, non-root, health check
└── package.json


===============================================================================
 3. AUTHENTICATION & SECURITY MECHANISM
===============================================================================

MECHANISM: JSON Web Tokens (JWT) — HS256 algorithm

The service uses stateless JWT authentication shared across all microservices.
Tokens are issued by `user-identity-service` and VERIFIED here without a DB
lookup (stateless verification via shared JWT_SECRET).

── TOKEN STRUCTURE ──────────────────────────────────────────────────────────

  Header:  { "alg": "HS256", "typ": "JWT" }
  Payload: {
    "userId":   "<MongoDB _id of the user>",
    "email":    "patient@example.com",
    "role":     "patient",         ← "patient" | "doctor" | "admin"
    "iat":      1712000000,
    "exp":      1712086400,
    "iss":      "medicate-user-identity-service",
    "aud":      "medicate-platform"
  }

── THREE ROLES ───────────────────────────────────────────────────────────────

  patient  — Initiate payments, view own transactions & notifications
  doctor   — Send notifications, view appointment-related records
  admin    — Full access: list all transactions, issue refunds, all notifications

── MIDDLEWARE USAGE ──────────────────────────────────────────────────────────

  const { authenticate, authorize } = require('./middleware/auth');

  // Any authenticated user:
  router.get('/profile', authenticate, handler);

  // Specific role(s):
  router.post('/refund',  authenticate, authorize('admin'), handler);
  router.post('/payment', authenticate, authorize('patient', 'admin'), handler);

── HOW TOKEN VERIFICATION WORKS ─────────────────────────────────────────────

  1. Client sends:  Authorization: Bearer <JWT>
  2. middleware/auth.js extracts the token and calls jwt.verify() with:
       - JWT_SECRET  (shared symmetric key)
       - issuer      (must match JWT_ISSUER env var)
       - audience    (must match JWT_AUDIENCE env var)
     If expired → 401 Token expired
     If invalid → 401 Invalid token
  3. req.user is set to the decoded payload
  4. authorize() checks req.user.role against the allowed list

── SECURITY MEASURES IMPLEMENTED ────────────────────────────────────────────

  ✓ Helmet.js          — Secure HTTP headers (CSP, HSTS, X-Frame-Options)
  ✓ Rate Limiting      — 200 requests per 15 minutes globally
  ✓ CORS               — Whitelisted origins only (ALLOWED_ORIGINS env var)
  ✓ Input Validation   — express-validator on all request bodies
  ✓ JWT RBAC           — Role guard on every protected route
  ✓ Stripe Webhooks    — HMAC-SHA256 signature verified before processing
  ✓ Secrets in env     — No keys hardcoded anywhere in the source code
  ✓ Non-root Docker    — Container runs as UID 1001
  ✓ Read-only FS       — K8s pod uses readOnlyRootFilesystem: true
  ✓ MongoDB URI        — Stored in Kubernetes Secret, not ConfigMap


===============================================================================
 4. PAYMENT INTEGRATION (STRIPE)
===============================================================================

── 4a. STRIPE SETUP ─────────────────────────────────────────────────────────

  1. Create a Stripe account at https://dashboard.stripe.com
  2. Dashboard > Developers > API Keys:
       Copy "Secret key"     → STRIPE_SECRET_KEY in .env
       Copy "Publishable key"→ STRIPE_PUBLISHABLE_KEY (used by frontend)
  3. Dashboard > Developers > Webhooks:
       Click "Add endpoint"  → URL: https://yourdomain.com/api/webhooks/stripe
       Select events:
         ✓ payment_intent.succeeded
         ✓ payment_intent.payment_failed
         ✓ charge.refunded
       Click "Reveal" under Signing secret → STRIPE_WEBHOOK_SECRET in .env

  For local testing, use the Stripe CLI:
    stripe listen --forward-to localhost:3003/api/webhooks/stripe
    (The CLI prints a webhook secret to use as STRIPE_WEBHOOK_SECRET in dev)

── 4b. PAYMENT FLOW ─────────────────────────────────────────────────────────

  Step 1 — Backend creates PaymentIntent (POST /api/payments/stripe/intent)
    - Patient sends: amount, currency, patientEmail, patientName, doctorId, etc.
    - Service creates/retrieves a Stripe Customer (deduplicates by email)
    - Creates a Stripe PaymentIntent → returns clientSecret + transactionId
    - Saves a pending Transaction record to MongoDB

  Step 2 — Frontend collects card & confirms (Stripe.js / Stripe Elements)
    - Use the clientSecret returned in Step 1 with stripe.confirmCardPayment()
    - This happens entirely client-side via Stripe's secure hosted fields
    - Card data never touches the Medicate backend

  Step 3 — Stripe fires webhook events (POST /api/webhooks/stripe)
    - payment_intent.succeeded  → Transaction updated to 'succeeded'
                                 → Email receipt sent
                                 → SMS receipt sent
    - payment_intent.payment_failed → Transaction updated to 'failed'
                                    → Failure email sent
    - charge.refunded           → Transaction updated to 'refunded'

  Alternative: Server-side confirm (POST /api/payments/stripe/confirm)
    - Provide paymentIntentId + paymentMethodId
    - Backend calls stripe.paymentIntents.confirm()
    - Notifications sent immediately on success

── 4c. WEBHOOKS ─────────────────────────────────────────────────────────────

  Endpoint: POST /api/webhooks/stripe
  - This route is mounted BEFORE express.json() so it receives the raw body
  - Stripe-Signature header is verified using constructWebhookEvent()
  - Any signature mismatch returns HTTP 400 immediately
  - Always returns HTTP 200 after processing to prevent Stripe retries

── 4d. REFUNDS ──────────────────────────────────────────────────────────────

  Endpoint: POST /api/payments/stripe/refund  (admin only)
  Body:
    {
      "transactionId": "uuid-of-transaction",
      "amount": 500,                         ← optional; omit for full refund
      "reason": "requested_by_customer"      ← duplicate | fraudulent | requested_by_customer
    }

  - Looks up the transaction in MongoDB
  - Calls stripe.refunds.create() against the stored PaymentIntent
  - Updates transaction status to 'refunded' or 'partially_refunded'

  Stripe TEST sandbox cards:
    Success:  4242 4242 4242 4242   CVV: any   Exp: any future date
    Declined: 4000 0000 0000 0002
    Auth req: 4000 0025 0000 3155


===============================================================================
 5. NOTIFICATION INTEGRATION
===============================================================================

── 5a. EMAIL (Nodemailer) ────────────────────────────────────────────────────

  Library: nodemailer  (npm package)
  Transport: SMTP — configurable via env vars

  BUILT-IN TEMPLATES:
    payment_success          — Full receipt with amount, doctor, transaction ID
    payment_failed           — Failure alert with reference number
    payment_refund           — Refund confirmation
    appointment_confirmation — Date, time, doctor details
    general                  — Plain message for any use

  DEVELOPMENT MODE (no SMTP_HOST configured):
    Nodemailer automatically creates an Ethereal.email test account.
    Emails are "sent" to the test inbox and a preview URL is printed
    to the console. No real emails are delivered. Zero configuration needed.

  PRODUCTION SETUP — Gmail:
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your@gmail.com
    SMTP_PASS=<App Password>  ← Not your real password!
    Google Account > Security > 2-Step Verification > App Passwords

  PRODUCTION SETUP — SendGrid (recommended for scale):
    SMTP_HOST=smtp.sendgrid.net
    SMTP_PORT=587
    SMTP_USER=apikey
    SMTP_PASS=<Your SendGrid API Key>

── 5b. SMS (Twilio) ──────────────────────────────────────────────────────────

  Library: twilio  (npm package)

  BUILT-IN TEMPLATES:
    payment_success          — Confirmation with amount
    payment_failed           — Failure alert with reference
    payment_refund           — Refund notification
    appointment_confirmation — Date, time, doctor
    appointment_reminder     — Pre-appointment alert
    prescription_ready       — Prescription availability
    otp                      — 6-digit time-limited OTP

  DEVELOPMENT MODE (no valid Twilio SID):
    SMS content is logged to console instead of being sent.
    No Twilio account or charges needed during development.

  SETUP:
    1. Sign up at https://www.twilio.com/try-twilio
    2. Console > Account Info → copy Account SID & Auth Token
    3. Messaging > Phone Numbers → buy or use trial number
    4. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER in .env

  Phone numbers MUST be in E.164 format: +94771234567


===============================================================================
 6. ENVIRONMENT VARIABLES SETUP
===============================================================================

  cd services/transaction-notify-service
  copy .env.example .env      # Windows
  # cp .env.example .env      # Mac / Linux
  # Then open .env and fill in real values

Critical variables:
  JWT_SECRET         — Must EXACTLY match the value in user-identity-service
  MONGODB_URI        — Local MongoDB or Atlas connection string
  STRIPE_SECRET_KEY  — From Stripe Dashboard (sk_test_... or sk_live_...)
  STRIPE_WEBHOOK_SECRET — From Stripe Webhook settings (whsec_...)
  SMTP_*             — Leave blank for auto Ethereal in dev
  TWILIO_*           — Leave blank for mock SMS in dev


===============================================================================
 7. LOCAL DEVELOPMENT
===============================================================================

  Prerequisites: Node.js 18+, MongoDB (local) or Atlas URI

  cd services/transaction-notify-service
  npm install
  copy .env.example .env     (then edit the file)
  npm run dev

  Service starts at: http://localhost:3003
  Health check:      GET  http://localhost:3003/health

  Testing Stripe webhooks locally:
    Install Stripe CLI: https://stripe.com/docs/stripe-cli
    stripe login
    stripe listen --forward-to localhost:3003/api/webhooks/stripe
    Copy the printed webhook secret → STRIPE_WEBHOOK_SECRET in .env

  Trigger test events:
    stripe trigger payment_intent.succeeded


===============================================================================
 8. DOCKER SETUP
===============================================================================

  Build:
    docker build -t medicate/transaction-notify-service:latest .

  Run standalone:
    docker run -d \
      --name transaction-notify \
      -p 3003:3003 \
      --env-file .env \
      medicate/transaction-notify-service:latest

  Add to docker-compose.yml (project root):
  ─────────────────────────────────────────
    transaction-notify-service:
      build: ./services/transaction-notify-service
      container_name: medicate-transaction-notify
      ports:
        - "3003:3003"
      environment:
        - NODE_ENV=production
        - MONGODB_URI=mongodb://mongodb:27017/medicate-transactions
        - JWT_SECRET=${JWT_SECRET}
        - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
        - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
        - SMTP_HOST=${SMTP_HOST}
        - SMTP_USER=${SMTP_USER}
        - SMTP_PASS=${SMTP_PASS}
        - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
        - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
        - TWILIO_FROM_NUMBER=${TWILIO_FROM_NUMBER}
      depends_on:
        - mongodb
      networks:
        - medicate-network
      restart: unless-stopped
  ─────────────────────────────────────────
  docker compose up --build transaction-notify-service


===============================================================================
 9. KUBERNETES DEPLOYMENT STEPS
===============================================================================

  PREREQUISITES:
    - kubectl configured to your cluster
    - Image pushed to a container registry
    - Namespace created: kubectl apply -f k8s/namespace.yaml

  STEP 1 — Build and push the image:
    docker build -t your-registry/medicate-transaction-notify:v1.0 .
    docker push your-registry/medicate-transaction-notify:v1.0

  STEP 2 — Create a Kubernetes Secret for sensitive values:
    kubectl create secret generic transaction-notify-secret \
      --namespace=medicate \
      --from-literal=MONGODB_URI="mongodb+srv://..." \
      --from-literal=JWT_SECRET="your_jwt_secret" \
      --from-literal=STRIPE_SECRET_KEY="sk_live_..." \
      --from-literal=STRIPE_WEBHOOK_SECRET="whsec_..." \
      --from-literal=SMTP_HOST="smtp.sendgrid.net" \
      --from-literal=SMTP_USER="apikey" \
      --from-literal=SMTP_PASS="SG.xxx" \
      --from-literal=TWILIO_ACCOUNT_SID="ACxxx" \
      --from-literal=TWILIO_AUTH_TOKEN="xxx" \
      --from-literal=TWILIO_FROM_NUMBER="+1234567890"

  STEP 3 — Apply non-sensitive config:
    kubectl apply -f k8s/configmap.yaml

  STEP 4 — Deploy all manifests:
    kubectl apply -f k8s/deployment.yaml
    kubectl apply -f k8s/service.yaml
    kubectl apply -f k8s/ingress.yaml

  STEP 5 — Verify:
    kubectl get pods -n medicate
    kubectl logs -f deployment/transaction-notify-service -n medicate
    kubectl port-forward svc/transaction-notify-service 3003:3003 -n medicate
    curl http://localhost:3003/health

  STEP 6 — Auto-scaling (optional):
    kubectl apply -f k8s/hpa.yaml

  ROLLING UPDATE:
    kubectl set image deployment/transaction-notify-service \
      transaction-notify=your-registry/medicate-transaction-notify:v1.1 \
      -n medicate

  ROLLBACK:
    kubectl rollout undo deployment/transaction-notify-service -n medicate


===============================================================================
 10. API REFERENCE SUMMARY
===============================================================================

  BASE URL: http://localhost:3003

  ── Health (no auth) ──────────────────────────────────────────────────────
  GET   /health

  ── Stripe Payments ───────────────────────────────────────────────────────
  POST  /api/payments/stripe/intent       patient, admin
        Body: { amount, currency, patientId, patientEmail, patientName,
                patientPhone, doctorId, appointmentId, description }
        Returns: { clientSecret, paymentIntentId, transactionId, customerId }

  POST  /api/payments/stripe/confirm      patient, admin
        Body: { paymentIntentId, paymentMethodId }

  POST  /api/payments/stripe/refund       admin only
        Body: { transactionId, amount (optional), reason }

  GET   /api/payments/stripe/methods      patient, admin
        Query: ?customerId=cus_xxx

  ── Transactions ──────────────────────────────────────────────────────────
  GET   /api/payments/transactions        admin only
        Query: ?status=&patientId=&doctorId=&page=1&limit=20

  GET   /api/payments/my-transactions     patient only

  GET   /api/payments/transactions/:id    patient (own), doctor, admin

  ── Notifications ─────────────────────────────────────────────────────────
  POST  /api/notifications/send           admin, doctor
        Body: { recipientId, recipientRole, channel, type, email|phone, data }

  GET   /api/notifications                admin only
        Query: ?channel=&type=&status=&page=1&limit=20

  GET   /api/notifications/my             patient, doctor

  GET   /api/notifications/:id            patient (own), doctor, admin

  ── Webhook (no JWT — server-to-server) ───────────────────────────────────
  POST  /api/webhooks/stripe              Stripe servers (signature verified)

  ── Auth Header (all protected routes) ────────────────────────────────────
  Authorization: Bearer <JWT_TOKEN>


===============================================================================
 11. SECURITY CHECKLIST
===============================================================================

  [x] JWT HS256 — signed and verified on every request
  [x] Issuer + Audience claims validated in token
  [x] Role-based access control (patient / doctor / admin) on every route
  [x] Stripe webhook signature verified with HMAC-SHA256
  [x] Helmet.js — secure HTTP response headers
  [x] Rate limiting — 200 req / 15 min (global)
  [x] CORS — whitelist only via ALLOWED_ORIGINS
  [x] Input validation — express-validator on all request bodies
  [x] All secrets in .env only, never hardcoded in source
  [x] .env in .gitignore — .env.example safe to commit
  [x] Dockerfile runs as non-root (UID 1001)
  [x] Kubernetes readOnlyRootFilesystem: true
  [x] Kubernetes Secrets for all sensitive values
  [x] Error responses never expose stack traces in production

===============================================================================
 Member 4 — Dewmina Wanninayake
 Distributed Systems — Y3 S1
 Medicate Smart Healthcare Platform
===============================================================================

# Smart Rental House Management and Discovery Platform
## Final Year Engineering Capstone Project Report & Technical Specification

---

## 1. Executive Summary & Problem Definition
The urban rental housing market in major Indian metropolitan regions faces significant friction characterized by fragmented listings, unverified middle-men brokers, non-standardized lease agreements, manual offline rent collection, and lack of accountability for maintenance grievances.

The **Smart Rental House Management and Discovery Platform** is an enterprise-grade full-stack web application and AI recommendation system designed to provide an end-to-end digital lifecycle:
1. **Tenants** discover verified rental homes through multi-criteria search, OpenStreetMap location mapping, and personalized AI match scoring, apply online, sign digital lease agreements, pay monthly rent through Razorpay, and download cryptographically verified digital receipts.
2. **Property Owners** manage listings, review tenant applications with automatic 1-year lease generation, track monthly rent collection ledgers, and manage maintenance work orders.
3. **Platform Administrators** audit user activities, verify property deeds and photos, inspect grievances, and monitor high-level platform revenue and occupancy metrics.

---

## 2. System Architecture & Tech Stack

```
+-------------------------------------------------------------------------------+
|                                CLIENT LAYER                                   |
|   React 18 + Vite + Tailwind CSS + Lucide Icons + React-Leaflet OpenStreetMap  |
+---------------------------------------+---------------------------------------+
                                        | (HTTPS / REST)
+---------------------------------------v---------------------------------------+
|                              NODE.JS BACKEND                                  |
|   Express.js API Gateway + JWT RBAC Middleware + Zod Validation + Winston     |
+-------------------+-----------------------------------+-----------------------+
                    |                                   |
                    | (HTTP Inter-service)              | (Prisma ORM)
+-------------------v-------------------+       +-------v-----------------------+
|         AI RECOMMENDATION SERVICE     |       |       POSTGRESQL DATABASE     |
|   FastAPI + Scikit-Learn + NumPy      |       |   21 Relational Tables        |
|   Multi-Factor Cosine Similarity      |       |   Normalized Schemas          |
+---------------------------------------+       +-------------------------------+
```

### Technology Matrix
* **Frontend**: React 18, Vite, Tailwind CSS, React-Leaflet, Lucide React, Axios.
* **Backend API Gateway**: Node.js, Express.js, Prisma ORM, Zod Schema Validation, JSON Web Tokens (JWT), Crypto, Supertest.
* **AI Recommendation Microservice**: Python 3.10+, FastAPI, NumPy, Scikit-learn, Uvicorn.
* **Database & ORM**: PostgreSQL 15, Prisma Client (with seamless in-memory fallback for zero-configuration testing).
* **Payment Gateway**: Razorpay Checkout SDK with HMAC SHA256 digital signature validation.
* **Containerization**: Docker, Docker Compose, Multi-stage Nginx builds.

---

## 3. Database Architecture & Relational Schema (21 Models)

The database schema is designed in 3NF (Third Normal Form) with strict foreign key constraints, composite unique indexes, and audit timestamps.

### Primary Entities:
1. **User & Profiles**:
   - `User` (id, email, passwordHash, fullName, phone, role, status)
   - `TenantProfile` (budgetMin, budgetMax, preferredCity, preferredArea, preferredBhk, tenantType, occupation)
   - `OwnerProfile` (companyName, taxId, bankAccountNumber, bankIfscCode, verifiedAt)
   - `AdminProfile` (department, permissions)
2. **Properties & Media**:
   - `Property` (id, title, propertyType, bhk, bathrooms, areaSqft, monthlyRent, securityDeposit, status, verificationStatus)
   - `PropertyLocation` (address, area, city, state, pincode, latitude, longitude)
   - `PropertyImage` (url, imageType, displayOrder)
   - `PropertyAmenity` & `Amenity` (Many-to-many relationship with 11+ standard amenities)
3. **Leases, Billing & Financial Transactions**:
   - `RentalApplication` (status: PENDING, UNDER_REVIEW, APPROVED, REJECTED)
   - `Rental` (active lease agreement, rentDueDay, noticePeriodDays)
   - `RentalAgreement` (agreementNumber, termsSummary, digitalSignatureStatus)
   - `RentInvoice` (billingMonth, baseRent, maintenance, totalAmount, status: PENDING, PAID, OVERDUE)
   - `Payment` (gatewayOrderId, gatewayPaymentId, gatewaySignature, status: SUCCESS)
   - `Receipt` (receiptNumber: `REC-YYYYMM-XXXX`, transactionReference, amountPaid)
4. **Operations & Governance**:
   - `MaintenanceRequest` (category, description, priority, status: OPEN, IN_PROGRESS, RESOLVED)
   - `Review` (rating 1-5, cleanlinessRating, locationRating, comment)
   - `Complaint` (category, description, priority, adminResponse, status)
   - `Notification` (type, title, message, isRead, link)
   - `AuditLog` (action, entityType, entityId, ipAddress, metadata)

---

## 4. AI Recommendation Algorithm & Mathematical Formulation

The recommendation engine calculates a normalized multi-factor composite match score \( S \in [0, 1] \) between a tenant profile \( T \) and candidate property \( P \):

\[
S(T, P) = \sum_{i=1}^{7} w_i \cdot s_i(T, P)
\]

Where the weights \( w_i \) are calibrated as:
1. **Budget Tolerance (\( w_1 = 0.25 \))**:
   \[
   s_1 = \begin{cases}
   1.0 & \text{if } B_{\min} \le \text{Rent} \le B_{\max} \\
   0.95 & \text{if } \text{Rent} < B_{\min} \\
   \exp\left(-\frac{(\text{Rent} - B_{\max})^2}{2\sigma^2}\right) & \text{if } \text{Rent} > B_{\max}
   \end{cases}
   \]
2. **Location / City Proximity (\( w_2 = 0.25 \))**: Exact area match (1.0), city match (0.5), other (0.2).
3. **BHK Configuration Match (\( w_3 = 0.15 \))**: Exact BHK (1.0), \( \pm 1 \) BHK (0.6), other (0.3).
4. **Property Type Compatibility (\( w_4 = 0.10 \))**: Match (1.0), compatible (0.8), other (0.4).
5. **Tenant Classification (\( w_5 = 0.10 \))**: Open to Any (1.0), Bachelor/Family policy match (1.0), violation (0.2).
6. **Amenities Jaccard Vector (\( w_6 = 0.10 \))**: \( s_6 = \frac{|A_T \cap A_P|}{|A_T|} \).
7. **Haversine Distance Decay (\( w_7 = 0.05 \))**:
   \[
   d = 2R \arcsin \sqrt{\sin^2(\Delta \phi / 2) + \cos \phi_1 \cos \phi_2 \sin^2(\Delta \lambda / 2)}
   \]

---

## 5. Security & Payment Integrity

1. **Authentication**:
   - Passwords hashed using `bcrypt` (10 rounds).
   - Stateless JWT tokens containing user role, subject ID, and session expiration.
   - Granular Role-Based Access Control (RBAC) middleware verifying Tenant, Owner, and Admin permissions.
2. **Payment Gateway Security**:
   - Order creation locks amount directly from the verified database invoice, preventing client-side price tampering.
   - Server-side signature validation computes `HMAC-SHA256(order_id + "|" + payment_id, SECRET_KEY)` before invoice status is updated to `PAID`.
   - Immutable digital receipt generation with unique sequence numbering (`REC-YYYYMM-XXXX`).

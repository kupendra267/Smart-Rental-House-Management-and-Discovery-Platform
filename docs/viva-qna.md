# Viva Voce & Technical Defense Q&A Guide

## 1. Why use PostgreSQL instead of MongoDB/NoSQL?
**Answer**: Rental platforms require strict ACID transactions and relational integrity. Operations like lease creation, invoice generation, payment confirmation, and receipt generation involve multi-table modifications that must either commit fully or rollback (e.g. marking an invoice as PAID while inserting payment and receipt rows). Relational schemas enforce unique constraints (preventing duplicate billing for the same month) and strict foreign keys (preventing orphan records).

## 2. Why use a separate Python FastAPI ML service instead of Node.js?
**Answer**: Python is the industry standard for data science and machine learning with optimized C-extensions (NumPy, Scikit-Learn, Pandas). Separating the recommendation engine into an autonomous microservice prevents heavy matrix computations from blocking the Node.js event loop, follows the single responsibility principle, and allows independent scaling and deployment.

## 3. Why is payment verification performed server-side with HMAC SHA256?
**Answer**: Client-side callbacks can easily be intercepted, forged, or spoofed by malicious users pretending an invoice has been paid. By computing the HMAC SHA256 signature server-side using the private `PAYMENT_KEY_SECRET` and comparing it with the signature returned from the gateway, the backend cryptographically proves the transaction's authenticity before updating financial ledgers.

## 4. How does the AI recommendation handle the "Cold Start" problem?
**Answer**: When a new tenant has no historical interactions (views, favorites, or applications), collaborative filtering fails. Our platform overcomes this by employing Content-Based Filtering and Multi-Factor Preference Matching based on tenant-declared profile attributes (budget range, preferred city/area, BHK requirement, and tenant category).

## 5. What indexing strategy is implemented in the database?
**Answer**:
- B-tree indexing on `users(email)` for $O(\log n)$ credential lookups.
- Composite multi-column index on `properties(city, area, monthly_rent, bhk)` to accelerate multi-parameter property catalogue search and sorting.
- Unique composite index on `rent_invoices(rental_id, billing_month)` to ensure idempotency in automated rent billing.

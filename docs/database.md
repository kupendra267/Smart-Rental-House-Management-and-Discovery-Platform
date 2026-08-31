# Database Design & Schema Specification

## 1. Overview
The database layer uses PostgreSQL 15+ managed via Prisma ORM. The relational model is strictly normalized (3NF) to guarantee zero redundancy and full transaction integrity.

## 2. Core Entity Tables & Relationships

```
User (1) <----> (1) TenantProfile
User (1) <----> (1) OwnerProfile
User (1) <----> (N) Notification
User (1) <----> (N) Complaint
User (1) <----> (N) AuditLog

OwnerProfile (1) <----> (N) Property
Property (1) <----> (1) PropertyLocation
Property (1) <----> (N) PropertyImage
Property (1) <----> (N) PropertyAmenity <----> (N) Amenity
Property (1) <----> (N) Favorite <----> (N) TenantProfile
Property (1) <----> (N) Application <----> (N) TenantProfile
Property (1) <----> (N) Rental <----> (N) TenantProfile
Property (1) <----> (N) Review <----> (N) TenantProfile

Rental (1) <----> (1) RentalAgreement
Rental (1) <----> (N) RentInvoice
Rental (1) <----> (N) MaintenanceRequest

RentInvoice (1) <----> (N) Payment
Payment (1) <----> (1) Receipt
```

## 3. Key Indexing Strategy
To ensure sub-millisecond query performance on large datasets:
- `users(email)`: Unique B-tree index for rapid login queries.
- `properties(city, area, monthly_rent, bhk)`: Composite index for multi-filter search queries.
- `properties(status, verification_status)`: Filter index for public catalogue rendering.
- `applications(tenant_id, property_id, status)`: Index for duplicate submission prevention and status tracking.
- `rent_invoices(rental_id, billing_month)`: Composite unique constraint to guarantee zero duplicate billings.
- `payments(gateway_order_id, gateway_payment_id)`: Unique indexes for payment reconciliation and idempotency.

## 4. Referential Actions & Constraints
- Hard deletion of critical audit trails is prohibited (`status = 'DELETED'` soft delete pattern for users).
- Deleting an owner or tenant with active rentals is prevented via foreign key restriction (`onDelete: Restrict`).
- Property images and location metadata cascade on property deletion (`onDelete: Cascade`).

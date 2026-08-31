# REST API Reference Documentation

All API responses follow the standard unified JSON response contract:

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Detailed error explanation",
  "errorCode": "RESOURCE_NOT_FOUND"
}
```

---

## 1. Authentication & Users (`/api/auth`)
* `POST /api/auth/register` - Create a new user account (Tenant/Owner) with auto profile creation.
* `POST /api/auth/login` - Validate credentials, return JWT access token and user payload.
* `GET /api/auth/me` - Return currently authenticated user profile and roles.
* `POST /api/auth/forgot-password` - Request password reset token.
* `POST /api/auth/reset-password` - Execute password update with verification token.

---

## 2. Properties & Search (`/api/properties`)
* `GET /api/properties` - Public search with pagination, filtering (city, area, rent, bhk, tenant type, amenities), sorting (price, newest, distance), and map bounding boxes.
* `GET /api/properties/:id` - Detailed property view including images, amenities, location, owner verification badge, and reviews.
* `POST /api/properties` - *(Owner only)* Create new property draft/submission.
* `PUT /api/properties/:id` - *(Owner only)* Update property details.
* `DELETE /api/properties/:id` - *(Owner only)* Archive/Delete property.
* `POST /api/properties/:id/images` - *(Owner only)* Upload multi-image gallery with specific room tags.
* `POST /api/properties/:id/report` - *(Tenant only)* Report fraudulent/suspicious property.

---

## 3. Recommendations (`/api/recommendations`)
* `GET /api/recommendations` - Returns personalized property matches scored by the FastAPI AI microservice with explanation strings.

---

## 4. Favorites & Comparison (`/api/favorites`, `/api/properties/compare`)
* `GET /api/favorites` - List tenant's saved homes.
* `POST /api/favorites/:propertyId` - Bookmark a property.
* `DELETE /api/favorites/:propertyId` - Remove bookmark.
* `POST /api/properties/compare` - Compare 2 to 4 properties side-by-side.

---

## 5. Rental Applications (`/api/applications`)
* `POST /api/applications` - Submit rental application with move-in date and occupants.
* `GET /api/applications/tenant` - List tenant's submitted applications.
* `GET /api/applications/owner` - List applications received for owner's properties.
* `PATCH /api/applications/:id/status` - Approve, reject, or mark under review.

---

## 6. Rentals & Invoices (`/api/rentals`, `/api/invoices`)
* `GET /api/rentals` - List active leases.
* `GET /api/rentals/:id` - Full lease details and agreement document.
* `GET /api/invoices` - List monthly rent obligations.

---

## 7. Payments & Receipts (`/api/payments`)
* `POST /api/payments/create-order` - Generate server-side Razorpay order for an invoice.
* `POST /api/payments/verify` - Verify cryptographic HMAC SHA256 signature and mark invoice `PAID`.
* `POST /api/payments/webhook` - Webhook receiver for automated asynchronous confirmation.
* `GET /api/payments/receipt/:paymentId` - Download digital PDF receipt.

---

## 8. Maintenance & Reviews (`/api/maintenance`, `/api/reviews`, `/api/complaints`)
* `POST /api/maintenance` - Submit maintenance ticket.
* `GET /api/maintenance` - List tickets.
* `PATCH /api/maintenance/:id/status` - Update ticket resolution lifecycle.
* `POST /api/reviews` - Rate and review rented home.
* `POST /api/complaints` - Submit grievance to platform admin.

---

## 9. Admin Management (`/api/admin`)
* `GET /api/admin/analytics` - High-level metrics, transactions, registrations, property distribution.
* `GET /api/admin/properties/pending` - Pending listing approvals.
* `PATCH /api/admin/properties/:id/verify` - Approve/Reject property listing.
* `GET /api/admin/users` - User directory with suspend/activate capabilities.
* `GET /api/admin/audit-logs` - System audit trail.

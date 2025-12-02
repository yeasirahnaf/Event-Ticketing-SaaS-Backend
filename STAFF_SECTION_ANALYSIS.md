# Staff Section Analysis - Implementation Plan Compliance

## Executive Summary

This document analyzes the `src/stuff` (staff) section against the requirements specified in `event_ticketing_implementation_plan.md`. The analysis reveals **critical architectural mismatches** and **missing features** that need to be addressed.

---

## 🚨 Critical Issues

### 1. **Architecture Mismatch: Separate Staff Table vs. Tenant Users**

**Plan Requirement:**
- Staff should use the `users` table (shared with admin and TenantAdmin)
- Staff membership to tenants should be tracked via `tenant_users` table with `role='staff'`
- No separate `staff` table should exist

**Current Implementation:**
- ❌ Separate `staff` table (`StaffEntity`) with its own structure
- ❌ Staff has `email` and `passwordHash` fields directly in `StaffEntity`
- ❌ Duplicates user management logic instead of using shared `users` table
- ❌ Creates a separate authentication path instead of using the unified auth system

**Impact:** This creates data duplication, authentication complexity, and violates the single source of truth principle for user management.

**Required Fix:**
- Remove `StaffEntity` table
- Use `UserEntity` + `TenantUserEntity` (with `role='staff'`) for staff management
- Staff should authenticate through the same `/auth/login` endpoint as other users
- Staff profile data (position, phone, gender) could be stored in a separate `staff_profiles` table linked to `user_id`, OR extended in `users` table

---

### 2. **Module Import Naming Inconsistencies**

**Issue:**
```typescript
// staff.module.ts has wrong imports:
import { User_3_Controller } from './staff.controller';
import { User_3_Entity } from './User_3.entity';
import { User_3_Service } from './staff.service';
```

**Current Files:**
- ✅ `staff.controller.ts` exports `StaffController`
- ✅ `staff.service.ts` exports `StaffService`
- ✅ `staff.entity.ts` exports `StaffEntity`

**Impact:** Module won't work correctly due to import mismatches.

**Required Fix:** Update `staff.module.ts` to use correct imports.

---

### 3. **Role Guard Mismatch**

**Issue:**
```typescript
// staff.guard.ts checks for:
if (user.role !== 'STAFF' && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')

// But auth.service.ts uses:
role = activeTenantUser.role as 'TenantAdmin' | 'staff';  // lowercase 'staff'
```

**Impact:** Staff guard will reject valid staff users because it checks for uppercase 'STAFF' but auth service uses lowercase 'staff'.

**Required Fix:** Update `StaffGuard` to check for lowercase 'staff' or use the existing `RolesGuard` with `@Roles('staff')` decorator.

---

## ⚠️ Missing Features (Per Plan Requirements)

### 4. **Read-Only Access to Events and Ticket Types**

**Plan Requirement (Line 70-71):**
> Staff should have read-only access to `events` and `ticket_types` for assignments and capacity checks.

**Current Implementation:**
- ❌ No endpoints to view events
- ❌ No endpoints to view ticket types
- ❌ No capacity checking functionality

**Required Implementation:**
```typescript
// GET /staff/events - List events for tenant (read-only)
// GET /staff/events/:id - Get event details
// GET /staff/events/:id/ticket-types - Get ticket types for event
// GET /staff/events/:id/capacity - Check remaining capacity
```

---

### 5. **Order Lookup by Email or Order Code**

**Plan Requirement (Line 72):**
> Staff should be able to look up attendees by email or order code.

**Current Implementation:**
- ✅ Has `searchTickets` by attendee name/email
- ❌ Missing order lookup by order code/public lookup token
- ❌ Missing order lookup by buyer email

**Required Implementation:**
```typescript
// GET /staff/orders/search?email=... - Find orders by buyer email
// GET /staff/orders/search?code=... - Find order by public lookup token or order ID
// GET /staff/orders/:id - Get order details with tickets
```

---

### 6. **Staff Entity Structure Issues**

**Current `StaffEntity` has:**
- `email` and `passwordHash` (should be in `users` table)
- `fullName` (should be in `users` table)
- `position`, `phoneNumber`, `gender` (staff-specific, could stay)
- `isActive` (duplicates `tenant_users.status`)

**Plan Structure:**
- Staff should be a `UserEntity` with a `TenantUserEntity` link (role='staff')
- Staff-specific profile data should be minimal or in a separate profile table

---

## ✅ Correctly Implemented Features

### 7. **Ticket Check-In Functionality**

**Status:** ✅ **CORRECTLY IMPLEMENTED**

- ✅ QR code scanning via `POST /staff/:id/checkin`
- ✅ Updates `checkedInAt` timestamp
- ✅ Prevents duplicate check-ins
- ✅ Logs check-in activities
- ✅ Sends confirmation emails (optional)

**Matches Plan Requirements (Line 71):** "scan QR payloads, update `checked_in_at`"

---

### 8. **Activity Logging**

**Status:** ✅ **CORRECTLY IMPLEMENTED**

- ✅ Creates activity logs for check-ins
- ✅ Logs invalid QR scans
- ✅ Logs duplicate scans
- ✅ Staff can create incident reports via `POST /staff/:id/logs`
- ✅ Staff can view their own logs via `GET /staff/:id/logs`

**Matches Plan Requirements (Line 73):** "write simple incident reports tied to an event"

---

### 9. **Ticket Search and Attendance Records**

**Status:** ✅ **PARTIALLY CORRECT**

- ✅ Search tickets by attendee name/email
- ✅ Get attendance records (checked-in tickets)
- ✅ Filter by event ID
- ✅ Pagination support

**Minor Gap:** Could add more search filters (by order code, ticket type, date range)

---

### 10. **Tenant Isolation**

**Status:** ✅ **CORRECTLY IMPLEMENTED**

- ✅ All queries filter by `tenantId` from JWT token
- ✅ Staff can only access data for their tenant
- ✅ Proper tenant context in all service methods

---

## 📋 Feature Comparison Table

| Feature | Plan Requirement | Current Status | Notes |
|---------|----------------|----------------|-------|
| **Authentication** | Use `users` + `tenant_users` | ❌ Separate `staff` table | Architecture mismatch |
| **Check-in via QR** | ✅ Required | ✅ Implemented | Working correctly |
| **Read Events** | ✅ Read-only access | ❌ Missing | Need endpoints |
| **Read Ticket Types** | ✅ Read-only access | ❌ Missing | Need endpoints |
| **Order Lookup** | ✅ By email/code | ⚠️ Partial | Has ticket search, missing order lookup |
| **Activity Logs** | ✅ Write incident reports | ✅ Implemented | Working correctly |
| **Attendance Records** | ✅ View checked-in tickets | ✅ Implemented | Working correctly |
| **Tenant Isolation** | ✅ Required | ✅ Implemented | Properly enforced |

---

## 🔧 Required Fixes (Priority Order)

### **P0 - Critical (Must Fix)**

1. **Fix Module Imports** (`staff.module.ts`)
   - Change `User_3_Controller` → `StaffController`
   - Change `User_3_Entity` → `StaffEntity`
   - Change `User_3_Service` → `StaffService`

2. **Fix Staff Guard** (`staff.guard.ts`)
   - Change `'STAFF'` → `'staff'` (lowercase)
   - Or better: Remove `StaffGuard` and use `RolesGuard` with `@Roles('staff')`

3. **Architectural Decision:**
   - **Option A (Recommended):** Refactor to use `UserEntity` + `TenantUserEntity` pattern
   - **Option B (Quick Fix):** Keep `StaffEntity` but remove `email`/`passwordHash`, link to `UserEntity`

### **P1 - High Priority (Should Fix)**

4. **Add Event Read-Only Endpoints**
   - `GET /staff/events` - List tenant events
   - `GET /staff/events/:id` - Get event details
   - `GET /staff/events/:id/ticket-types` - Get ticket types

5. **Add Order Lookup Endpoints**
   - `GET /staff/orders/search?email=...` - Find by buyer email
   - `GET /staff/orders/search?code=...` - Find by order code/token
   - `GET /staff/orders/:id` - Get order with tickets

6. **Add Capacity Check Endpoint**
   - `GET /staff/events/:id/capacity` - Check remaining ticket capacity

### **P2 - Medium Priority (Nice to Have)**

7. **Enhance Search Functionality**
   - Add order code search to ticket search
   - Add date range filters
   - Add ticket type filters

8. **Add Staff Profile Management**
   - If keeping `StaffEntity`, ensure it's properly linked to `UserEntity`
   - Or migrate to `UserEntity` + profile extension

---

## 📝 Code Quality Issues

### 11. **Missing Module Registration**

**Issue:** `StaffModule` is not imported in `app.module.ts`

**Current `app.module.ts`:**
```typescript
imports: [
  TenantAdminModule,
  AdminModule,
  AuthModule,
  // ❌ StaffModule is missing
]
```

**Required Fix:** Add `StaffModule` to `app.module.ts` imports.

---

### 12. **Service Dependencies**

**Current Issues:**
- `StaffService` depends on `MailerService` which may not exist (file was deleted per git status)
- Missing proper error handling for missing dependencies

**Required Fix:**
- Check if `MailerService` exists or make it optional
- Add proper dependency injection guards

---

### 13. **DTO Validation**

**Status:** ✅ **GOOD**

- ✅ Proper validation decorators in `staff.dto.ts`
- ✅ Phone number validation for Bangladesh (`@IsPhoneNumber('BD')`)
- ✅ Password strength requirements
- ✅ Enum validation for position and gender

---

## 🎯 Recommended Refactoring Approach

### Phase 1: Quick Fixes (1-2 hours)
1. Fix module imports
2. Fix guard role check
3. Add `StaffModule` to `app.module.ts`
4. Fix `MailerService` dependency

### Phase 2: Missing Features (4-6 hours)
1. Add event read-only endpoints
2. Add order lookup endpoints
3. Add capacity check functionality

### Phase 3: Architecture Alignment (8-12 hours) - **OPTIONAL**
1. Refactor to use `UserEntity` + `TenantUserEntity`
2. Remove separate `StaffEntity` or convert to profile extension
3. Update authentication flow
4. Migrate existing staff data

---

## 📊 Compliance Score

| Category | Score | Status |
|----------|-------|--------|
| **Architecture** | 2/10 | ❌ Major mismatch |
| **Core Features** | 6/10 | ⚠️ Missing key features |
| **Code Quality** | 7/10 | ✅ Generally good |
| **Security** | 8/10 | ✅ Tenant isolation works |
| **Overall** | **5.75/10** | ⚠️ **Needs Improvement** |

---

## 🔍 Detailed Feature Analysis

### Check-In Flow Analysis

**Current Implementation:**
```typescript
POST /staff/:id/checkin
Body: { qrPayload: string }
```

**Strengths:**
- ✅ Validates ticket existence
- ✅ Prevents duplicate check-ins
- ✅ Logs all activities
- ✅ Returns safe ticket data (hides QR payload)

**Improvements Needed:**
- ⚠️ Should use `@CurrentUser()` instead of `:id` param for security
- ⚠️ Should validate staff has access to the event's tenant
- ⚠️ Could add batch check-in support

---

### Activity Logging Analysis

**Current Implementation:**
- ✅ Automatic logging for check-ins
- ✅ Manual log creation for incidents
- ✅ Proper tenant and actor tracking

**Strengths:**
- Good audit trail
- Proper metadata storage

**Improvements Needed:**
- ⚠️ Could add event ID to logs for better filtering
- ⚠️ Could add log categories/types

---

## 📚 References

- **Plan Document:** `event_ticketing_implementation_plan.md`
- **Staff Requirements:** Lines 9, 68-73, 130-144
- **Database Schema:** Lines 33-44, 91-94

---

## ✅ Conclusion

The staff section has **good core functionality** (check-in, logging, search) but suffers from:
1. **Architectural misalignment** with the plan's user management approach
2. **Missing read-only access** to events and ticket types
3. **Incomplete order lookup** functionality
4. **Code quality issues** (imports, guards, module registration)

**Recommendation:** Fix P0 issues immediately, then add missing features (P1), and consider architectural refactoring (P2) if time permits.


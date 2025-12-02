# Staff & Admin Integration Verification

## Executive Summary

This document verifies that the staff and admin sections work together correctly, identifying integration issues and data consistency problems.

**Overall Status:** ⚠️ **ISSUES FOUND** - Needs fixes

---

## Integration Points

### 1. Authentication Flow ✅

**How It Works:**
1. Staff registration creates `UserEntity` + `StaffEntity` + `TenantUserEntity` (role='staff')
2. Admin can create `TenantUserEntity` with role='staff'
3. Auth service uses `AdminService.findActiveTenantUsersByUserId()` to get roles
4. JWT token includes `role='staff'` and `tenantId`

**Status:** ✅ **WORKING CORRECTLY**

---

### 2. Staff Registration vs Admin Creation ⚠️

#### Issue: Inconsistent Creation Paths

**Path 1: Staff Registration** (`POST /staff/register`)
- Creates: `UserEntity` + `StaffEntity` + `TenantUserEntity`
- Complete staff record

**Path 2: Admin Creates Tenant User** (`POST /admin/tenant-users` with role='staff')
- Creates: Only `TenantUserEntity`
- Missing: `StaffEntity` record
- Result: User can authenticate but staff endpoints will fail

**Impact:** ⚠️ **MEDIUM**
- Admin-created staff users can't use staff endpoints
- Data inconsistency between `TenantUserEntity` and `StaffEntity`

**Required Fix:**
- Option A: Admin should use staff registration endpoint
- Option B: Admin creation should also create `StaffEntity`
- Option C: Staff endpoints should handle missing `StaffEntity` gracefully

---

### 3. Staff Deletion & TenantUserEntity Sync ❌

#### Issue: Data Inconsistency on Deletion

**Current Implementation:**
```typescript
// staff.service.ts - deleteStaff()
staff.isActive = false;  // Only updates StaffEntity
// TenantUserEntity status is NOT updated!
```

**Problem:**
- Staff is marked inactive in `StaffEntity`
- But `TenantUserEntity` status remains 'active'
- User can still authenticate and access staff endpoints
- Admin sees them as active in tenant_users list

**Impact:** ❌ **CRITICAL** - Security issue

**Required Fix:**
```typescript
// When deactivating staff, also update TenantUserEntity
await this.tenantUserRepo.update(
  { tenantId: staff.tenantId, userId: staff.userId },
  { status: 'inactive' }
);
```

---

### 4. Admin Viewing Staff Members ✅

**How It Works:**
- Admin can query `tenant_users` with `role='staff'`
- Endpoint: `GET /admin/tenant-users?role=staff`
- Returns: `TenantUserEntity` with user and tenant relations

**Status:** ✅ **WORKING CORRECTLY**

**Note:** Admin sees `TenantUserEntity` records, not `StaffEntity` records. This is correct per plan.

---

### 5. Staff Status Updates ⚠️

#### Issue: Status Not Synced

**Current State:**
- `StaffEntity.isActive` - boolean (true/false)
- `TenantUserEntity.status` - enum ('active', 'inactive', 'suspended')

**Problem:**
- These are not synchronized
- Updating one doesn't update the other
- Can lead to inconsistent state

**Required Fix:**
- Sync `StaffEntity.isActive` with `TenantUserEntity.status`
- When `isActive = false` → `status = 'inactive'`
- When `isActive = true` → `status = 'active'`

---

### 6. User Entity Updates ⚠️

**Current Implementation:**
- Staff can update email/password in `UserEntity` via staff endpoints
- Admin can update email/password in `UserEntity` via admin endpoints
- Both update the same `UserEntity` record

**Status:** ✅ **WORKING** (but could have race conditions)

**Recommendation:** Add optimistic locking or transactions for concurrent updates

---

## Data Flow Diagrams

### Staff Registration Flow

```
POST /staff/register
  ↓
StaffService.registerStaff()
  ↓
1. Check/Create UserEntity
  ↓
2. Create StaffEntity (linked to UserEntity)
  ↓
3. Create TenantUserEntity (role='staff', status='active')
  ↓
✅ Complete staff record
```

### Admin Creates Staff Flow

```
POST /admin/tenant-users { role: 'staff' }
  ↓
AdminService.createTenantUser()
  ↓
Create TenantUserEntity (role='staff')
  ↓
❌ Missing: StaffEntity
❌ Missing: UserEntity (if doesn't exist)
```

### Staff Deletion Flow (Current - BROKEN)

```
DELETE /staff/:id
  ↓
StaffService.deleteStaff()
  ↓
Set StaffEntity.isActive = false
  ↓
❌ TenantUserEntity.status still 'active'
❌ User can still authenticate
```

### Staff Deletion Flow (Fixed)

```
DELETE /staff/:id
  ↓
StaffService.deleteStaff()
  ↓
1. Set StaffEntity.isActive = false
  ↓
2. Update TenantUserEntity.status = 'inactive'
  ↓
✅ User cannot authenticate
✅ Admin sees inactive status
```

---

## Integration Issues Summary

| Issue | Severity | Status | Impact |
|-------|----------|--------|--------|
| Staff deletion doesn't update TenantUserEntity | ❌ Critical | Broken | Security issue - deactivated staff can still login |
| Admin creation doesn't create StaffEntity | ⚠️ Medium | Inconsistent | Admin-created staff can't use staff endpoints |
| Status not synced between StaffEntity and TenantUserEntity | ⚠️ Medium | Inconsistent | Data inconsistency |
| No validation for missing StaffEntity | ⚠️ Low | Missing | Staff endpoints may fail unexpectedly |

---

## Required Fixes

### Fix 1: Sync TenantUserEntity on Staff Deletion (CRITICAL)

**File:** `src/stuff/staff.service.ts`

```typescript
async deleteStaff(staffId: string): Promise<{ message: string }> {
  const staff = await this.staffRepo.findOne({ 
    where: { id: staffId },
    relations: ['user']
  });

  if (!staff) {
    throw new NotFoundException(`Staff with id ${staffId} not found`);
  }

  // Deactivate StaffEntity
  staff.isActive = false;
  await this.staffRepo.save(staff);

  // Also update TenantUserEntity status to 'inactive'
  await this.tenantUserRepo.update(
    { tenantId: staff.tenantId, userId: staff.userId },
    { status: 'inactive' }
  );

  return { message: 'Staff member deactivated successfully' };
}
```

### Fix 2: Handle Missing StaffEntity in Staff Endpoints (MEDIUM)

**File:** `src/stuff/staff.service.ts`

Add validation in methods that use `staffId`:
```typescript
async getCurrentStaff(staffId: string): Promise<StaffEntity> {
  // First check if TenantUserEntity exists with role='staff'
  const tenantUser = await this.tenantUserRepo.findOne({
    where: { userId: staffId, role: 'staff' },
    relations: ['user']
  });

  if (!tenantUser) {
    throw new NotFoundException(`Staff record not found`);
  }

  // Then get StaffEntity
  const staff = await this.staffRepo.findOne({
    where: { userId: staffId, tenantId: tenantUser.tenantId },
    relations: ['user', 'tenant'],
  });

  // If StaffEntity doesn't exist but TenantUserEntity does, create it
  if (!staff && tenantUser) {
    // Create minimal StaffEntity
    const newStaff = this.staffRepo.create({
      tenantId: tenantUser.tenantId,
      userId: tenantUser.userId,
      fullName: tenantUser.user.fullName,
      position: 'STAFF', // Default
      isActive: tenantUser.status === 'active',
    });
    return await this.staffRepo.save(newStaff);
  }

  return staff;
}
```

### Fix 3: Sync Status Updates (MEDIUM)

**File:** `src/stuff/staff.service.ts`

When updating staff status, also update TenantUserEntity:
```typescript
// Add method to sync status
private async syncTenantUserStatus(
  tenantId: string,
  userId: string,
  isActive: boolean
): Promise<void> {
  const status = isActive ? 'active' : 'inactive';
  await this.tenantUserRepo.update(
    { tenantId, userId },
    { status }
  );
}
```

---

## Testing Scenarios

### Scenario 1: Staff Registration → Login → Deletion

1. ✅ Register staff via `POST /staff/register`
2. ✅ Login via `POST /auth/login` → Should get JWT with role='staff'
3. ✅ Access staff endpoints
4. ❌ Delete staff via `DELETE /staff/:id`
5. ❌ Try to login → **SHOULD FAIL but currently WORKS** (BUG)

### Scenario 2: Admin Creates Staff → Login

1. ⚠️ Admin creates tenant_user with role='staff' via `POST /admin/tenant-users`
2. ⚠️ User tries to login → **SHOULD WORK**
3. ❌ User tries to access `GET /staff/me` → **SHOULD FAIL** (no StaffEntity)

### Scenario 3: Admin Views Staff

1. ✅ Admin queries `GET /admin/tenant-users?role=staff`
2. ✅ Should see all staff members
3. ⚠️ Status might be inconsistent with StaffEntity.isActive

---

## Recommendations

### Short Term (Critical)

1. **Fix staff deletion** to update TenantUserEntity status
2. **Add validation** in staff endpoints for missing StaffEntity
3. **Document** that admin should use staff registration endpoint

### Medium Term

1. **Create helper method** to sync StaffEntity and TenantUserEntity status
2. **Add admin endpoint** to create staff (calls staff registration internally)
3. **Add migration** to sync existing data

### Long Term

1. **Consider removing StaffEntity** and storing profile data in UserEntity or separate profile table
2. **Add database triggers** to keep status in sync
3. **Add audit logging** for status changes

---

## Conclusion

**Current State:** ⚠️ **FUNCTIONAL BUT HAS ISSUES**

**Critical Issues:**
- Staff deletion doesn't prevent authentication (security issue)
- Admin-created staff can't use staff endpoints

**Recommendation:** Fix critical issues immediately, then address medium-priority items.


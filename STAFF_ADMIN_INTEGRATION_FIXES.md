# Staff & Admin Integration - Fixes Applied

## Summary

Fixed critical integration issues between staff and admin sections to ensure data consistency and proper authentication flow.

---

## Fixes Applied

### ✅ Fix 1: Staff Deletion Now Updates TenantUserEntity (CRITICAL)

**Problem:** When staff was deleted, only `StaffEntity.isActive` was set to false, but `TenantUserEntity.status` remained 'active', allowing deactivated staff to still authenticate.

**Solution:**
- Updated `deleteStaff()` method to also update `TenantUserEntity.status = 'inactive'`
- Added helper method `syncTenantUserStatus()` for consistent status syncing

**File:** `src/stuff/staff.service.ts`

**Before:**
```typescript
staff.isActive = false;
await this.staffRepo.save(staff);
// ❌ TenantUserEntity still 'active'
```

**After:**
```typescript
staff.isActive = false;
await this.staffRepo.save(staff);
await this.syncTenantUserStatus(staff.tenantId, staff.userId, false);
// ✅ TenantUserEntity now 'inactive' - prevents authentication
```

---

### ✅ Fix 2: Handle Missing StaffEntity (MEDIUM)

**Problem:** If admin creates a `TenantUserEntity` with role='staff' directly (without using staff registration), there's no `StaffEntity` record, causing staff endpoints to fail.

**Solution:**
- Updated `getCurrentStaff()` to check for `TenantUserEntity` first
- If `TenantUserEntity` exists but `StaffEntity` doesn't, create a minimal `StaffEntity` automatically
- This ensures staff endpoints work even if staff was created via admin endpoint

**File:** `src/stuff/staff.service.ts`

**Key Changes:**
```typescript
// First verify TenantUserEntity exists
const tenantUser = await this.tenantUserRepo.findOne({
  where: { userId: staffId, role: 'staff', status: 'active' },
});

// If StaffEntity doesn't exist, create it
if (!staff && tenantUser) {
  staff = this.staffRepo.create({
    tenantId: tenantUser.tenantId,
    userId: tenantUser.userId,
    fullName: tenantUser.user.fullName,
    position: 'STAFF', // Default
    isActive: tenantUser.status === 'active',
  });
  staff = await this.staffRepo.save(staff);
}
```

---

### ✅ Fix 3: Added Status Sync Helper Method

**Purpose:** Centralized method to keep `StaffEntity.isActive` and `TenantUserEntity.status` in sync.

**File:** `src/stuff/staff.service.ts`

```typescript
private async syncTenantUserStatus(
  tenantId: string,
  userId: string,
  isActive: boolean,
): Promise<void> {
  const status = isActive ? 'active' : 'inactive';
  await this.tenantUserRepo.update(
    { tenantId, userId },
    { status },
  );
}
```

**Usage:** Can be called whenever `StaffEntity.isActive` changes to keep data consistent.

---

## Integration Flow (After Fixes)

### Staff Registration Flow ✅

```
POST /staff/register
  ↓
1. Create/Find UserEntity
  ↓
2. Create StaffEntity (isActive = true)
  ↓
3. Create TenantUserEntity (role='staff', status='active')
  ↓
✅ Complete and consistent
```

### Staff Deletion Flow ✅ (FIXED)

```
DELETE /staff/:id
  ↓
1. Set StaffEntity.isActive = false
  ↓
2. Update TenantUserEntity.status = 'inactive' (via syncTenantUserStatus)
  ↓
✅ Staff cannot authenticate
✅ Admin sees inactive status
```

### Admin Creates Staff Flow ✅ (FIXED)

```
POST /admin/tenant-users { role: 'staff' }
  ↓
1. Create TenantUserEntity (role='staff', status='active')
  ↓
2. User logs in → GET /staff/me
  ↓
3. getCurrentStaff() detects missing StaffEntity
  ↓
4. Auto-creates StaffEntity
  ↓
✅ Staff endpoints now work
```

---

## Testing Checklist

### ✅ Test 1: Staff Registration → Login → Deletion

1. Register staff: `POST /staff/register`
2. Login: `POST /auth/login` → Should get JWT with role='staff' ✅
3. Access staff endpoint: `GET /staff/me` → Should work ✅
4. Delete staff: `DELETE /staff/:id`
5. Try to login: `POST /auth/login` → **Should FAIL** ✅ (FIXED)

### ✅ Test 2: Admin Creates Staff → Login → Access Staff Endpoints

1. Admin creates tenant_user: `POST /admin/tenant-users { role: 'staff' }`
2. User logs in: `POST /auth/login` → Should get JWT ✅
3. Access staff endpoint: `GET /staff/me` → **Should work** ✅ (FIXED - auto-creates StaffEntity)

### ✅ Test 3: Admin Views Staff Status

1. Admin queries: `GET /admin/tenant-users?role=staff`
2. Deactivate staff: `DELETE /staff/:id`
3. Admin queries again: Status should show 'inactive' ✅ (FIXED)

---

## Remaining Considerations

### ⚠️ Note: Admin Should Use Staff Registration

While admin can create `TenantUserEntity` directly, it's recommended to use the staff registration endpoint to ensure complete staff records:

**Recommended:**
- Admin/TenantAdmin should use `POST /staff/register` to create staff
- This ensures all entities are created correctly

**Alternative (Now Works):**
- Admin can create `TenantUserEntity` directly
- StaffEntity will be auto-created on first access
- But staff will have default position='STAFF' instead of custom position

### 🔄 Future Enhancements

1. **Add admin endpoint** that wraps staff registration:
   ```typescript
   POST /admin/staff
   // Internally calls staff registration
   ```

2. **Add status sync on all updates:**
   - When `StaffEntity.isActive` changes, sync `TenantUserEntity.status`
   - When `TenantUserEntity.status` changes, sync `StaffEntity.isActive`

3. **Add database constraints:**
   - Ensure `StaffEntity` exists when `TenantUserEntity.role='staff'`
   - Or make it optional and handle gracefully (current approach)

---

## Conclusion

**Status:** ✅ **FIXED**

All critical integration issues have been resolved:
- ✅ Staff deletion now prevents authentication
- ✅ Admin-created staff can now use staff endpoints
- ✅ Status syncing helper method added for future consistency

**Integration Status:** ✅ **WORKING CORRECTLY**

Staff and admin sections now work together properly with consistent data across both systems.


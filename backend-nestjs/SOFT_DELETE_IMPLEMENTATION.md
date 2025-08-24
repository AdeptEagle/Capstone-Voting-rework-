# Soft Delete Implementation Guide

## Overview
This guide explains how to implement and use the soft delete system for candidates, positions, departments, and courses.

## What is Soft Delete?
Soft delete marks records as deleted without actually removing them from the database. This preserves:
- Election history and results
- Audit trails
- Data integrity
- Ability to restore accidentally deleted items

## Database Changes

### 1. New Fields Added
Each table now has:
- `is_deleted`: Boolean flag (false = active, true = deleted)
- `deleted_at`: Timestamp when deletion occurred

### 2. Tables Modified
- `positions`
- `candidates` 
- `departments`
- `courses`

## Implementation Steps

### Step 1: Run Database Migration
```bash
# Option 1: Run the SQL file directly
psql -d your_database -f prisma/migrations/add_soft_delete_fields.sql

# Option 2: Use Prisma migrate (recommended)
npx prisma migrate dev --name add_soft_delete_fields
```

### Step 2: Update Backend Services

#### Before (Hard Delete):
```typescript
// OLD: Completely removes the record
await prisma.candidate.delete({
  where: { id: candidateId }
});
```

#### After (Soft Delete):
```typescript
// NEW: Marks as deleted but preserves data
await prisma.candidate.update({
  where: { id: candidateId },
  data: {
    isDeleted: true,
    deletedAt: new Date()
  }
});
```

### Step 3: Update Queries

#### Before:
```typescript
// OLD: Gets all candidates
const candidates = await prisma.candidate.findMany();
```

#### After:
```typescript
// NEW: Gets only active candidates (excludes deleted)
const candidates = await prisma.candidate.findMany({
  where: { isDeleted: false }
});

// To include deleted items (for admin purposes):
const allCandidates = await prisma.candidate.findMany({
  where: { isDeleted: true } // Only deleted
});

// To get both active and deleted:
const allCandidates = await prisma.candidate.findMany(); // No filter
```

## API Endpoints to Update

### 1. Candidate Service
- `deleteCandidate()` → Soft delete
- `getCandidates()` → Filter out deleted by default
- `getCandidateById()` → Include deleted option

### 2. Position Service  
- `deletePosition()` → Soft delete
- `getPositions()` → Filter out deleted by default
- `getPositionById()` → Include deleted option

### 3. Department Service
- `deleteDepartment()` → Soft delete
- `getDepartments()` → Filter out deleted by default

### 4. Course Service
- `deleteCourse()` → Soft delete
- `getCourses()` → Filter out deleted by default

## New Features to Add

### 1. Restore Functionality
```typescript
async restoreCandidate(candidateId: string) {
  return await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      isDeleted: false,
      deletedAt: null
    }
  });
}
```

### 2. View Deleted Items
```typescript
async getDeletedCandidates() {
  return await prisma.candidate.findMany({
    where: { isDeleted: true },
    include: {
      position: true,
      department: true,
      course: true
    }
  });
}
```

### 3. Permanent Delete (Admin Only)
```typescript
async permanentlyDeleteCandidate(candidateId: string) {
  // Only allow if no votes exist
  const votes = await prisma.vote.findMany({
    where: { candidateId }
  });
  
  if (votes.length > 0) {
    throw new Error('Cannot permanently delete candidate with voting history');
  }
  
  return await prisma.candidate.delete({
    where: { id: candidateId }
  });
}
```

## Frontend Updates

### 1. Admin Panels
- Show deletion status (active/deleted)
- Add restore buttons for deleted items
- Add "View Deleted" toggle

### 2. Election History
- Data remains intact (no more "Unknown" values)
- Shows actual candidate names and positions
- Maintains historical accuracy

## Benefits

### 1. Data Integrity
- Election results never break
- Historical data preserved
- No more "Unknown" or "undefined" values

### 2. Recovery Options
- Restore accidentally deleted items
- Maintain audit trails
- Compliance with data retention policies

### 3. Business Continuity
- Elections continue to work
- Results remain accurate
- No data loss

## Testing the System

### 1. Test Soft Delete
1. Create a candidate
2. Soft delete the candidate
3. Verify it's hidden from normal queries
4. Check election history still shows the candidate

### 2. Test Restore
1. Restore the deleted candidate
2. Verify it appears in normal queries again
3. Check all data is intact

### 3. Test Election History
1. End an election with candidates
2. Soft delete some candidates
3. Verify election history shows correct data
4. No "Unknown" or broken references

## Migration Safety

### 1. Backup First
```bash
pg_dump your_database > backup_before_soft_delete.sql
```

### 2. Test on Development
- Test all scenarios before production
- Verify no data loss
- Check performance impact

### 3. Rollback Plan
If issues occur, you can:
- Restore from backup
- Remove the new columns
- Revert to hard delete

## Performance Considerations

### 1. Indexes Added
- `is_deleted` indexes for fast filtering
- `deleted_at` indexes for timestamp queries

### 2. Query Optimization
- Default queries exclude deleted items
- Use indexes for efficient filtering
- Consider pagination for large datasets

## Next Steps

1. **Run the migration** to add soft delete fields
2. **Update backend services** to use soft delete
3. **Add restore functionality** for admin use
4. **Update frontend** to show deletion status
5. **Test thoroughly** to ensure data integrity
6. **Deploy to production** with confidence

## Support

If you encounter any issues during implementation:
1. Check the migration logs
2. Verify database schema changes
3. Test with sample data first
4. Review the Prisma documentation for soft delete patterns

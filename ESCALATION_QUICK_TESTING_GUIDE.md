# 🧪 Quick Manual Testing Guide - Escalation Feature

**Date**: May 15, 2026  
**Time Required**: 1-2 hours for complete testing

---

## ⚡ 5-Minute Quick Test

```bash
# 1. Login as Admin
# URL: http://localhost:5173/login
# Email: admin@wepromotehr.com
# Password: Admin@123

# 2. Create test manager and employees (via API or UI)
# Using API:
curl -X POST http://localhost:8000/api/hr/manager \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Manager",
    "email": "test.manager@company.com",
    "password": "TestPass@123",
    "department": "Sales",
    "employeeId": "MGR-TEST-001"
  }'

# 3. Create employees under this manager
curl -X POST http://localhost:8000/api/hr/employee \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Employee 1",
    "email": "emp1@company.com",
    "password": "EmpPass@123",
    "department": "Sales",
    "managerId": "manager_id_from_step_2",
    "employeeId": "EMP-TEST-001"
  }'

# 4. Trigger manual escalation check
curl -X POST http://localhost:8000/api/escalations/check/manual \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 5. Verify escalation was created
curl -X GET http://localhost:8000/api/escalations/pending \
  -H "Authorization: Bearer MANAGER_TOKEN"

# Expected: Should see escalation with status "PENDING"

# 6. Login as Manager and check for pop-up
# The manager should see a pop-up notification on login

# 7. Assign a task to resolve the escalation
curl -X POST http://localhost:8000/api/task/create \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "employee_id",
    "taskTitle": "Test Task",
    "description": "Test Task Description",
    "workDate": "2026-05-16",
    "priority": "HIGH"
  }'

# 8. Verify escalation is now resolved
curl -X GET http://localhost:8000/api/escalations/pending \
  -H "Authorization: Bearer MANAGER_TOKEN"

# Expected: Escalation status should be "RESOLVED"
```

---

## 🔧 Full Manual Testing Procedure

### Setup Phase (15 minutes)

#### 1. Database Reset (Optional)
```sql
-- If starting fresh, reset escalation tables
DELETE FROM taskEscalation WHERE createdAt > NOW() - INTERVAL '24 hours';
DELETE FROM notification WHERE type LIKE '%ESCALATION%' AND createdAt > NOW() - INTERVAL '24 hours';
DELETE FROM taskAssignment WHERE status IN ('ASSIGNED', 'PENDING');

-- Verify cleanup
SELECT COUNT(*) as pending_escalations FROM taskEscalation WHERE status = 'PENDING';
```

#### 2. Create Test Users

**Create Manager A**:
```bash
curl -X POST http://localhost:8000/api/hr/manager \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manager Test A",
    "email": "manager.a@testco.com",
    "password": "ManagerTest@123",
    "department": "Sales",
    "employeeId": "MGR-A-001"
  }'

# Copy the returned manager_id for next steps
```

**Create Employee 1 under Manager A**:
```bash
curl -X POST http://localhost:8000/api/hr/employee \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Employee Test 1",
    "email": "emp.test.1@testco.com",
    "password": "EmployeeTest@123",
    "department": "Sales",
    "managerId": "MANAGER_A_ID_FROM_ABOVE",
    "employeeId": "EMP-A-001"
  }'
```

**Create Employee 2 under Manager A**:
```bash
curl -X POST http://localhost:8000/api/hr/employee \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Employee Test 2",
    "email": "emp.test.2@testco.com",
    "password": "EmployeeTest@123",
    "department": "Sales",
    "managerId": "MANAGER_A_ID_FROM_ABOVE",
    "employeeId": "EMP-A-002"
  }'
```

**Create HR User**:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HR Test User",
    "email": "hr.test@testco.com",
    "password": "HRTest@123",
    "role": "HR"
  }'
```

**Create Admin User** (if not exists):
```bash
# Admin typically created during setup
# Use existing admin account for testing
```

---

### Test Phase 1: Daily Detection (Immediate Test)

#### TC-001: Verify Daily Check Job Creates Escalations

**Step 1: Trigger Manual Check**
```bash
curl -X POST http://localhost:8000/api/escalations/check/manual \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
{
  "success": true,
  "message": "Manual task assignment check completed",
  "escalationsCreated": 2
}
```

**Step 2: Verify in Database**
```sql
SELECT 
  e.id,
  emp.name as employee_name,
  m.name as manager_name,
  e.type,
  e.status,
  e.escalationDate
FROM taskEscalation e
JOIN "User" emp ON e.employeeId = emp.id
JOIN "User" m ON e.managerId = m.id
WHERE e.status = 'PENDING'
ORDER BY e.createdAt DESC
LIMIT 5;
```

**Expected Result**:
```
| id         | employee_name    | manager_name    | type                 | status  | escalationDate      |
|------------|------------------|-----------------|----------------------|---------|---------------------|
| esc-0001   | Employee Test 1  | Manager Test A  | NEXT_DAY_MISSING     | PENDING | 2026-05-16 00:00:00 |
| esc-0002   | Employee Test 2  | Manager Test A  | NEXT_DAY_MISSING     | PENDING | 2026-05-16 00:00:00 |
```

**Step 3: API Verification**
```bash
# Get escalations as Manager
curl -X GET http://localhost:8000/api/escalations/pending \
  -H "Authorization: Bearer MANAGER_A_TOKEN"

# Expected: Should show 2 pending escalations
```

---

### Test Phase 2: Manager Reminders (1 PM, 2 PM, 2:30 PM)

#### Option A: Real-Time Testing (Wait for Scheduled Time)

**At 1:00 PM:**
1. Open Manager A's email inbox (check test email service)
2. Look for email with subject containing "Task Assignment Reminder"
3. Verify email contains:
   - Employee name
   - Date of escalation
   - Action link

**At 1:00 PM (Frontend):**
1. Keep Manager A logged in on dashboard
2. Open browser console (F12 → Console tab)
3. Look for WebSocket message:
   ```
   Connected to escalation_reminder_1
   ```
4. Observe pop-up notification appear on screen
   - Title: "Task Assignment Reminder"
   - Message: "You have not assigned tasks to [Employee Name]"
   - Severity: Warning (yellow)

**At 2:00 PM:**
1. Verify second email sent (if task still not assigned)
2. Verify second pop-up on browser
3. Check database:
   ```sql
   SELECT reminder2SentAt FROM taskEscalation 
   WHERE id = 'esc-0001';
   -- Should NOT be NULL
   ```

**At 2:30 PM:**
1. Verify third email sent
2. Pop-up should have higher severity (orange/red)
3. Check database:
   ```sql
   SELECT reminder3SentAt FROM taskEscalation 
   WHERE id = 'esc-0001';
   -- Should NOT be NULL
   ```

#### Option B: Time-Skipping Test (Development Only)

```javascript
// In backend, temporarily modify escalationJobs.js for testing:
// Change schedule timing for testing (modify locally only)

// Original:
cron.schedule("0 13 * * *", ...); // 1:00 PM

// For testing (delete after):
cron.schedule("0 */1 * * *", ...); // Every hour

// Then restart server and trigger jobs hourly
```

---

### Test Phase 3: HR & Admin Escalation

#### At 3:00 PM: HR Escalation

**Database Verification:**
```sql
SELECT 
  id,
  status,
  reminder1SentAt,
  reminder2SentAt,
  reminder3SentAt,
  hrEscalatedAt
FROM taskEscalation 
WHERE id = 'esc-0001';

-- Expected:
-- status: 'HR_ESCALATED'
-- hrEscalatedAt: NOT NULL (timestamp at 3:00 PM)
```

**Email Verification:**
- Check HR user email inbox
- Should receive email with subject: "CRITICAL: Task Assignment Escalation"
- Contains manager and employee details

**Frontend:**
- If HR user logged in, should see critical pop-up
- Red background, highest urgency

---

#### At 4:00 PM: Admin Escalation

**Database Verification:**
```sql
SELECT 
  id,
  status,
  hrEscalatedAt,
  adminEscalatedAt
FROM taskEscalation 
WHERE id = 'esc-0001';

-- Expected:
-- status: 'ADMIN_ESCALATED'
-- adminEscalatedAt: NOT NULL (timestamp at 4:00 PM)
```

**Email Check:**
- Admin receives most severe notification
- Subject line includes "CRITICAL ESCALATION"

---

#### At 6:00 PM: Final Escalation

**Database Verification:**
```sql
SELECT 
  id,
  status,
  adminEscalatedAt,
  finalEscalatedAt
FROM taskEscalation 
WHERE id = 'esc-0001';

-- Expected:
-- status: 'FINAL_ESCALATED'
-- finalEscalatedAt: NOT NULL (timestamp at 6:00 PM)
```

**Result:**
- Final email sent to both HR and Admin
- Record marked as fully escalated
- Pop-up shows maximum urgency

---

### Test Phase 4: Task Assignment Resolves Escalation

#### When Manager Assigns Task:

**Step 1: Assign Task via API**
```bash
curl -X POST http://localhost:8000/api/task/create \
  -H "Authorization: Bearer MANAGER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP_TEST_1_ID",
    "taskTitle": "Complete Q2 Sales Report",
    "description": "Prepare and submit Q2 sales analysis",
    "workDate": "2026-05-16",
    "priority": "HIGH",
    "deadline": "2026-05-16T18:00:00Z"
  }'

# Expected Response:
{
  "success": true,
  "message": "Task created and assigned successfully",
  "taskId": "task-123"
}
```

**Step 2: Verify Escalation Resolution**
```bash
# Query escalation status
curl -X GET http://localhost:8000/api/escalations/pending \
  -H "Authorization: Bearer MANAGER_A_TOKEN"

# Expected: Escalation status should now be "RESOLVED"
```

**Step 3: Database Verification**
```sql
SELECT 
  id,
  status,
  resolvedAt
FROM taskEscalation 
WHERE id = 'esc-0001';

-- Expected:
-- status: 'RESOLVED'
-- resolvedAt: timestamp when task was assigned
```

---

### Test Phase 5: Manager Login Pop-up

#### Scenario A: Manager with Unresolved Escalations

**Steps:**
1. Logout of application completely
2. Login as Manager A
3. Wait for dashboard to load (1-2 seconds)

**Expected Result:**
- Pop-up appears immediately with message:
  ```
  "Attention! You have 1 employees with no assigned tasks for tomorrow"
  "Employee: Employee Test 1"
  "Click to assign tasks now"
  ```
- Pop-up has warning icon (⚠️)
- Button link to "Manage Tasks" page

---

#### Scenario B: Manager Logging In After Task Assigned

**Steps:**
1. Assign task to resolve escalation (from Phase 4)
2. Logout from browser
3. Login as Manager A again

**Expected Result:**
- No escalation pop-up appears
- Dashboard loads normally
- Celebration message might show "All tasks assigned!"

---

### Test Phase 6: Edge Cases

#### EC-001: Deleted Employee

**Setup:**
1. Create escalation for Employee
2. Delete the employee account

**Test:**
```bash
# Query escalations
curl -X GET http://localhost:8000/api/escalations/pending \
  -H "Authorization: Bearer MANAGER_A_TOKEN"

# Expected: 
# - Escalation still visible (with employee details)
# - No errors in API response
# - No 500 errors in backend logs
```

---

#### EC-002: Employee Reassigned Manager

**Setup:**
1. Create escalation under Manager A for Employee
2. Reassign Employee to Manager B

**Test:**
```sql
-- Update employee's manager
UPDATE "User" SET managerId = 'MANAGER_B_ID' 
WHERE id = 'EMP_TEST_1_ID';

-- Query escalations
SELECT * FROM taskEscalation 
WHERE employeeId = 'EMP_TEST_1_ID' 
AND managerId = 'MANAGER_A_ID';

-- Expected: Old escalation still shows Manager A (historical record)
```

---

#### EC-003: Multiple Concurrent Requests

**Using Artillery or Custom Script:**
```bash
# Create multiple tasks simultaneously
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/task/create \
    -H "Authorization: Bearer MANAGER_A_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"employeeId": "EMP_TEST_1_ID", ...}' &
done
wait

# Expected: All succeed without race conditions
```

---

### Test Phase 7: API Testing

#### Test All Endpoints:

**1. Get Pending Escalations**
```bash
curl -X GET http://localhost:8000/api/escalations/pending \
  -H "Authorization: Bearer TOKEN"

# Verify response structure:
# - success: boolean
# - count: number
# - data: array of escalation objects
```

**2. Get Manager History**
```bash
curl -X GET http://localhost:8000/api/escalations/manager/mgr-id/history \
  -H "Authorization: Bearer TOKEN"

# Verify includes all past escalations
```

**3. Get Statistics (Admin Only)**
```bash
curl -X GET http://localhost:8000/api/escalations/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Verify all count fields are present
```

**4. Resolve Escalation**
```bash
curl -X POST http://localhost:8000/api/escalations/esc-id/resolve \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resolutionReason": "Task assigned by manager"}'

# Verify escalation marked as RESOLVED
```

---

### Test Phase 8: Email Verification

**Gmail Testing Setup:**
1. Use Gmail's test mode or Mailtrap service
2. Configure in .env:
   ```
   MAIL_HOST=smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USER=test_username
   MAIL_PASS=test_password
   ```

**Verify Email Template:**
- [ ] Email contains manager name
- [ ] Email contains employee name
- [ ] Email contains escalation time
- [ ] Email contains action link
- [ ] Email formatting is professional
- [ ] Email subject is clear and urgent

---

### Test Phase 9: WebSocket/Real-time Notification

**Frontend Console Testing:**
```javascript
// In browser console, add logging:
const socket = io('http://localhost:8000', {
  query: { userId: 'MANAGER_A_ID' }
});

socket.on('escalation_reminder_1', (data) => {
  console.log('🔔 Reminder 1:', data);
});

socket.on('escalation_reminder_2', (data) => {
  console.log('🔔 Reminder 2:', data);
});

socket.on('escalation_reminder_3', (data) => {
  console.log('🔔 Reminder 3:', data);
});

socket.on('escalation_hr', (data) => {
  console.log('🚨 HR Escalation:', data);
});

socket.on('escalation_admin', (data) => {
  console.log('🚨🚨 Admin Escalation:', data);
});
```

---

## ✅ Testing Checklist

Complete Testing Verification:

- [ ] Daily check job creates escalations
- [ ] Manager receives email at 1 PM
- [ ] Manager sees pop-up at 1 PM
- [ ] In-app notification created at 1 PM
- [ ] Manager receives email at 2 PM (if task still not assigned)
- [ ] Manager receives email at 2:30 PM (if task still not assigned)
- [ ] HR receives email at 3 PM
- [ ] HR sees pop-up at 3 PM
- [ ] Admin receives email at 4 PM
- [ ] Admin sees pop-up at 4 PM
- [ ] HR receives final email at 6 PM
- [ ] Admin receives final email at 6 PM
- [ ] Task assignment resolves escalation
- [ ] Escalation status changes to RESOLVED
- [ ] Manager sees pop-up on login with unresolved escalations
- [ ] All API endpoints return correct data
- [ ] Database records are accurate
- [ ] No errors in backend logs
- [ ] WebSocket connections are stable
- [ ] Email templates are professional

---

## 🐛 Bug Report Template

**When Testing Issues:**

```
### Bug Title
[One-line description]

### Description
[What went wrong]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should have happened]

### Actual Behavior
[What actually happened]

### Screenshots/Logs
[Attach if available]

### Severity
- [ ] Critical (Feature broken)
- [ ] High (Major functionality affected)
- [ ] Medium (Minor functionality affected)
- [ ] Low (Cosmetic issue)

### Environment
- Backend: Node v[X]
- Database: Postgresql
- Frontend: React v[X]
- Browser: [Chrome/Firefox/Safari]
```

---

## 📞 Support

**Questions during testing?**
- Check backend logs: `tail -f logs/app.log`
- Check database: Query escalation tables
- Check email service: Verify SMTP configuration
- Check WebSocket: Open browser DevTools → Network → WS

**End of Quick Testing Guide**

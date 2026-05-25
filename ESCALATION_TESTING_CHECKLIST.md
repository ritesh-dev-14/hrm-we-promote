# 🎯 ESCALATION FEATURE - COMPREHENSIVE TESTING CHECKLIST

**Testing Date**: May 15, 2026  
**Feature**: Task Assignment Escalation System with Multi-Channel Notifications  
**Version**: 1.0 Production Ready  

---

## 📋 Pre-Testing Requirements

### Environment Setup
- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] PostgreSQL database connected and migrated
- [ ] `.env` file configured with email settings
- [ ] Node cron jobs initialized
- [ ] Socket.io initialized
- [ ] All dependencies installed (`npm install`)

### Test Data Preparation
- [ ] Create 1 test manager account
- [ ] Create 2-3 test employee accounts under manager
- [ ] Create 1 HR account
- [ ] Create 1 Admin account
- [ ] Verify no tasks assigned to test employees for next 4 days

### Tools Needed
- [ ] Postman or cURL for API testing
- [ ] Test email service (Mailtrap, Gmail test account, or similar)
- [ ] Browser DevTools for WebSocket inspection
- [ ] Database client (pgAdmin, DBeaver, or psql)
- [ ] Text editor for logging results

---

## ✅ TEST EXECUTION PLAN

### PHASE 1: Setup & Configuration (15 minutes)

#### Checkpoint 1.1: Verify Cron Job Initialization
**Steps:**
1. Start backend server
2. Check console output for:
   ```
   ================ SETTING UP ESCALATION JOBS ================
   📅 Daily check job scheduled at 12:59 AM
   ⏰ First reminder job scheduled at 1:00 PM
   ⏰ Second reminder job scheduled at 2:00 PM
   ⏰ Third reminder job scheduled at 2:30 PM
   📞 HR escalation job scheduled at 3:00 PM
   ⚡ Admin escalation job scheduled at 4:00 PM
   🚨 Final escalation job scheduled at 6:00 PM
   ================ ALL ESCALATION JOBS CONFIGURED ================
   ```

**Result**: ☐ PASS ☐ FAIL  
**Notes**: _______________________________________________

---

#### Checkpoint 1.2: Verify Email Configuration
**Steps:**
1. Check `.env` file for required email variables
2. Test email sending via API endpoint (if available)
3. Verify test email account is accessible

**Expected Email Config:**
```
MAIL_HOST=smtp.*.com
MAIL_PORT=587
MAIL_USER=your-email@company.com
MAIL_PASS=app-password
MAIL_FROM=noreply@wepromotehr.com
```

**Result**: ☐ PASS ☐ FAIL  
**Notes**: _______________________________________________

---

#### Checkpoint 1.3: Verify Socket.io Connection
**Steps:**
1. Open frontend in browser
2. Open DevTools → Network tab
3. Filter by "WS" (WebSocket)
4. Look for `/socket.io/` connection

**Expected**: Connected WebSocket showing green status

**Result**: ☐ PASS ☐ FAIL  
**Notes**: _______________________________________________

---

### PHASE 2: Daily Detection Job (30 minutes)

#### Test 2.1: Manual Escalation Check Trigger
**Endpoint**: `POST /api/escalations/check/manual`

**Command:**
```bash
curl -X POST http://localhost:8000/api/escalations/check/manual \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Manual task assignment check completed",
  "escalationsCreated": 2
}
```

**Verification:**
- [ ] HTTP Status: 200
- [ ] Response format is JSON
- [ ] escalationsCreated > 0 (if test employees have no tasks)
- [ ] No errors in backend logs

**Result**: ☐ PASS ☐ FAIL  
**Count of Escalations**: __________  
**Notes**: _______________________________________________

---

#### Test 2.2: Verify Escalation Records in Database
**Query:**
```sql
SELECT COUNT(*) as total_escalations FROM taskEscalation 
WHERE status = 'PENDING' AND DATE(createdAt) = CURRENT_DATE;
```

**Expected**: Count > 0 for today's date

**Result**: ☐ PASS ☐ FAIL  
**Record Count**: __________  
**Notes**: _______________________________________________

---

#### Test 2.3: Verify Employee Detection Logic
**Query:**
```sql
SELECT emp.name, COUNT(e.id) as escalation_count
FROM taskEscalation e
JOIN "User" emp ON e.employeeId = emp.id
WHERE DATE(e.createdAt) = CURRENT_DATE
GROUP BY emp.name;
```

**Expected**: Each employee without tasks should have 2 escalations (NEXT_DAY_MISSING, FUTURE_4_DAYS_MISSING)

**Result**: ☐ PASS ☐ FAIL  
**Employee Distribution**: _______________________________________________

---

### PHASE 3: API Endpoints Testing (20 minutes)

#### Test 3.1: GET /api/escalations/pending
**Purpose**: Verify manager can see their pending escalations

**Command:**
```bash
curl -X GET http://localhost:8000/api/escalations/pending \
  -H "Authorization: Bearer MANAGER_TOKEN"
```

**Verification Checklist:**
- [ ] HTTP Status: 200
- [ ] Response includes: success, count, data
- [ ] Data is array of escalations
- [ ] Each escalation has: id, employeeId, managerId, status
- [ ] Status is one of: PENDING, MANAGER_NOTIFIED, etc.

**Result**: ☐ PASS ☐ FAIL  
**Escalations Returned**: __________  
**Notes**: _______________________________________________

---

#### Test 3.2: GET /api/escalations/manager/:managerId/history
**Purpose**: Verify escalation history endpoint

**Command:**
```bash
curl -X GET http://localhost:8000/api/escalations/manager/MANAGER_ID/history \
  -H "Authorization: Bearer MANAGER_TOKEN"
```

**Verification:**
- [ ] Returns all escalations for this manager
- [ ] Sorted by creation date (newest first)
- [ ] Includes resolved escalations

**Result**: ☐ PASS ☐ FAIL  
**Total Records**: __________  
**Notes**: _______________________________________________

---

#### Test 3.3: GET /api/escalations/stats (Admin Only)
**Purpose**: Verify statistics endpoint

**Command:**
```bash
curl -X GET http://localhost:8000/api/escalations/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response Fields:**
- [ ] total: total escalations
- [ ] pending: currently pending
- [ ] managerNotified: with reminder sent
- [ ] hrEscalated: escalated to HR
- [ ] adminEscalated: escalated to Admin
- [ ] finalEscalated: final escalation sent
- [ ] resolved: resolved escalations

**Result**: ☐ PASS ☐ FAIL  
**Stats**: total:__ | pending:__ | resolved:__  
**Notes**: _______________________________________________

---

### PHASE 4: Manager Notifications (1 hour per reminder)

#### Test 4.1: First Reminder (1:00 PM)

**At Exactly 1:00 PM:**

**Email Verification:**
1. Check manager's test email inbox
2. Look for email with subject containing "Task Assignment Reminder"
3. Verify email body contains:
   - [ ] Manager name
   - [ ] Employee name
   - [ ] Escalation date
   - [ ] Action link to assign tasks

**Frontend Pop-up Verification:**
1. Keep manager logged in on dashboard
2. Observe screen at 1:00 PM
3. Look for pop-up with:
   - [ ] Title: "Task Assignment Reminder"
   - [ ] Yellow/warning background
   - [ ] Employee name visible
   - [ ] Close button (X)

**WebSocket Verification:**
1. Open browser DevTools → Console
2. Should see message about escalation_reminder_1 event
3. Pop-up should appear automatically

**Database Verification:**
```sql
SELECT reminder1SentAt FROM taskEscalation 
WHERE id = 'ESCALATION_ID' AND DATE(escalationDate) = CURRENT_DATE;
-- Should NOT be NULL
```

**Overall Result**: ☐ PASS ☐ FAIL  
**Email Received**: ☐ YES ☐ NO  
**Pop-up Appeared**: ☐ YES ☐ NO  
**WebSocket Event**: ☐ RECEIVED ☐ NOT RECEIVED  
**Time Accuracy**: _______________________________________________

---

#### Test 4.2: Second Reminder (2:00 PM)

**Prerequisites:**
- No task assigned between 1 PM and 2 PM
- Escalation still has status PENDING/MANAGER_NOTIFIED

**Steps:** (Same as Test 4.1)

**Email Check:**
- [ ] Second email received (different from first)
- [ ] Subject or body indicates this is reminder 2

**Pop-up Check:**
- [ ] Pop-up appears for reminder 2
- [ ] Message updated to reflect this is 2nd reminder

**Database Check:**
```sql
SELECT reminder2SentAt FROM taskEscalation WHERE id = 'ID';
```

**Overall Result**: ☐ PASS ☐ FAIL  
**Email Received**: ☐ YES ☐ NO  
**Pop-up Appeared**: ☐ YES ☐ NO  
**Notes**: _______________________________________________

---

#### Test 4.3: Third Reminder (2:30 PM)

**Prerequisites:**
- No task assigned yet
- Both reminder1 and reminder2 sent

**Steps:** (Same as Test 4.1-4.2)

**Email Check:**
- [ ] Third email received
- [ ] Subject emphasizes urgency ("URGENT" or similar)

**Pop-up Check:**
- [ ] Pop-up appears with MORE urgency
- [ ] Color changed to orange/red
- [ ] Auto-closes after 15 seconds (not 10)

**Database Check:**
```sql
SELECT reminder1SentAt, reminder2SentAt, reminder3SentAt 
FROM taskEscalation WHERE id = 'ID';
-- All three should have timestamps
```

**Overall Result**: ☐ PASS ☐ FAIL  
**Email Received**: ☐ YES ☐ NO  
**Pop-up Appeared**: ☐ YES ☐ NO  
**Urgency Level**: _______________________________________________

---

### PHASE 5: HR Escalation (3:00 PM)

#### Test 5.1: HR Escalation Email & Pop-up

**At Exactly 3:00 PM:**

**Email Verification:**
1. Check HR account email inbox
2. Look for email with subject: "CRITICAL: Task Assignment Escalation"
3. Email should contain:
   - [ ] Manager name and ID
   - [ ] Employee name and ID
   - [ ] Escalation history
   - [ ] Action required message

**HR Pop-up Verification:**
1. HR user should be logged in
2. Observe screen for pop-up
3. Should have:
   - [ ] Red background (critical)
   - [ ] Title: "CRITICAL: Task Not Assigned"
   - [ ] Auto-closes after 20 seconds

**Database Verification:**
```sql
SELECT status, hrEscalatedAt FROM taskEscalation WHERE id = 'ID';
-- status should be 'HR_ESCALATED'
-- hrEscalatedAt should NOT be NULL
```

**Overall Result**: ☐ PASS ☐ FAIL  
**HR Email Received**: ☐ YES ☐ NO  
**HR Pop-up Appeared**: ☐ YES ☐ NO  
**Status Updated**: ☐ YES ☐ NO  
**Time of HR Escalation**: _______________________________________________

---

### PHASE 6: Admin Escalation (4:00 PM)

#### Test 6.1: Admin Escalation Email & Pop-up

**At Exactly 4:00 PM:**

**Email Verification:**
1. Check Admin email inbox
2. Look for CRITICAL subject with urgency markers
3. Email contains escalation details

**Admin Pop-up Verification:**
1. Admin user logged in
2. Pop-up appears with maximum urgency:
   - [ ] Multiple warning icons
   - [ ] Red background
   - [ ] Message about failed escalation

**Database Verification:**
```sql
SELECT status, adminEscalatedAt FROM taskEscalation WHERE id = 'ID';
-- status should be 'ADMIN_ESCALATED'
-- adminEscalatedAt should NOT be NULL
```

**Overall Result**: ☐ PASS ☐ FAIL  
**Admin Email Received**: ☐ YES ☐ NO  
**Admin Pop-up Appeared**: ☐ YES ☐ NO  
**Status Updated**: ☐ YES ☐ NO  

---

### PHASE 7: Final Escalation (6:00 PM)

#### Test 7.1: Final Escalation to HR & Admin

**At Exactly 6:00 PM:**

**Email Verification:**
1. Both HR and Admin receive final notification
2. Subject: "FINAL NOTICE: Immediate Action Required"
3. Email emphasizes this is the last notice

**Pop-up Verification:**
1. Both HR and Admin see final pop-up
2. Highest urgency indicators

**Database Verification:**
```sql
SELECT status, finalEscalatedAt FROM taskEscalation WHERE id = 'ID';
-- status should be 'FINAL_ESCALATED'
-- finalEscalatedAt should NOT be NULL
```

**Overall Result**: ☐ PASS ☐ FAIL  
**HR Final Email**: ☐ YES ☐ NO  
**Admin Final Email**: ☐ YES ☐ NO  
**Final Pop-ups**: ☐ BOTH YES ☐ PARTIAL ☐ NO  

---

### PHASE 8: Task Assignment & Resolution (Immediate)

#### Test 8.1: Manager Assigns Task - Escalation Resolves

**Steps:**
1. Manager assigns a task to the employee for tomorrow
2. Use API or Frontend:

```bash
curl -X POST http://localhost:8000/api/task/create \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMPLOYEE_ID",
    "taskTitle": "Assignment Test Task",
    "description": "Task to test escalation resolution",
    "workDate": "2026-05-16",
    "priority": "HIGH"
  }'
```

**Verification:**
1. Task created successfully (HTTP 200/201)
2. Check escalation status immediately:

```bash
curl -X GET http://localhost:8000/api/escalations/pending \
  -H "Authorization: Bearer MANAGER_TOKEN"
```

3. Escalation should show status = 'RESOLVED'

**Database Verification:**
```sql
SELECT status, resolvedAt FROM taskEscalation 
WHERE id = 'ID';
-- status should be 'RESOLVED'
-- resolvedAt should have current timestamp
```

**Result**: ☐ PASS ☐ FAIL  
**Task Created**: ☐ YES ☐ NO  
**Escalation Resolved**: ☐ YES ☐ NO  
**Resolution Time**: _______________________________________________

---

#### Test 8.2: No More Reminders After Resolution

**Steps:**
1. Task assigned (from Test 8.1)
2. Wait for next scheduled job time (e.g., if after 2 PM, wait for 2:30 PM job)
3. Verify NO reminder is sent

**Expected:**
- [ ] No email for next scheduled reminder
- [ ] No pop-up appears
- [ ] escalation.resolvedAt is set
- [ ] Status is 'RESOLVED'

**Result**: ☐ PASS ☐ FAIL  
**Extra Reminders Received**: ☐ NONE ☐ YES (BUG)  
**Notes**: _______________________________________________

---

### PHASE 9: Manager Login Pop-up

#### Test 9.1: Manager Sees Escalation Alert on Login

**Steps:**
1. Create an unresolved escalation (from PHASE 2)
2. Logout from application completely
3. Login as Manager again
4. Observe for immediate pop-up

**Expected:**
- [ ] Pop-up appears within 2 seconds of login
- [ ] Title: "Pending Task Assignments"
- [ ] Message shows employee names
- [ ] Link to manage tasks

**Pop-up Content:**
```
"You have X employees without assigned tasks"
"- Employee Name 1"
"- Employee Name 2"
"Click here to assign tasks"
```

**Result**: ☐ PASS ☐ FAIL  
**Pop-up Timing**: _____________ seconds after login  
**Employee Names Shown**: _______________________________________________

---

#### Test 9.2: No Pop-up After Resolution

**Steps:**
1. Assign tasks to resolve all escalations
2. Logout
3. Login again
4. Observe for pop-ups

**Expected:**
- [ ] NO escalation pop-up appears
- [ ] Normal dashboard loads
- [ ] May show success message

**Result**: ☐ PASS ☐ FAIL  
**Unnecessary Pop-ups**: ☐ NONE ☐ YES (BUG)  

---

### PHASE 10: Edge Cases & Error Handling

#### Test 10.1: Manager with No Employees
**Setup**: Create a manager with no subordinates  
**Action**: Run daily check job  
**Expected**: No escalations created, no errors  
**Result**: ☐ PASS ☐ FAIL

---

#### Test 10.2: Employee Reassigned to Different Manager
**Setup**: 
1. Create escalation under Manager A
2. Reassign employee to Manager B  

**Query:**
```sql
UPDATE "User" SET managerId = 'MANAGER_B_ID' 
WHERE id = 'EMPLOYEE_ID';
```

**Expected**: 
- Old escalation remains (historical)
- New escalations created for Manager B

**Result**: ☐ PASS ☐ FAIL

---

#### Test 10.3: Email Delivery Failure Handling
**Simulate**: Block SMTP port or use invalid credentials  
**Expected**: 
- [ ] Job continues (doesn't crash)
- [ ] Error logged to backend
- [ ] In-app notification still created

**Result**: ☐ PASS ☐ FAIL

---

#### Test 10.4: Multiple Concurrent Task Assignments
**Steps**:
1. Create multiple escalations
2. Assign tasks to multiple employees simultaneously
3. Verify no race conditions

**Expected**: All resolve correctly

**Result**: ☐ PASS ☐ FAIL

---

### PHASE 11: Database Integrity

#### Test 11.1: Data Quality Checks
**Query**:
```sql
-- Find orphaned records
SELECT COUNT(*) FROM taskEscalation e
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE id = e.employeeId);
```

**Expected**: 0 orphaned records

**Result**: ☐ PASS ☐ FAIL

---

#### Test 11.2: Invalid State Transitions
**Query**:
```sql
SELECT COUNT(*) FROM taskEscalation 
WHERE hrEscalatedAt > finalEscalatedAt;
```

**Expected**: 0 invalid transitions

**Result**: ☐ PASS ☐ FAIL

---

### PHASE 12: Performance

#### Test 12.1: Response Time for APIs
**Steps**:
1. Call each API endpoint
2. Measure response time

**Expected (95th percentile)**:
- GET /escalations/pending: < 500ms
- GET /escalations/stats: < 1000ms
- POST /escalations/check/manual: < 5000ms

**Results**:
- pending: __________ ms
- stats: __________ ms
- manual check: __________ ms

**Result**: ☐ PASS ☐ FAIL

---

#### Test 12.2: Database Query Performance
**Steps**:
1. Run complex query
2. Check execution plan
3. Verify indexes are used

**Query**:
```sql
EXPLAIN ANALYZE
SELECT * FROM taskEscalation 
WHERE status = 'PENDING' AND managerId = 'ID';
```

**Expected**: Uses index, < 100ms execution

**Result**: ☐ PASS ☐ FAIL

---

## 📊 FINAL TEST SUMMARY

| Test Phase | Total Tests | Passed | Failed | Result |
|-----------|-----------|--------|--------|--------|
| 1. Setup & Config | 3 | ___ | ___ | ☐ ☐ |
| 2. Daily Detection | 3 | ___ | ___ | ☐ ☐ |
| 3. API Endpoints | 3 | ___ | ___ | ☐ ☐ |
| 4. Manager Reminders | 3 | ___ | ___ | ☐ ☐ |
| 5. HR Escalation | 1 | ___ | ___ | ☐ ☐ |
| 6. Admin Escalation | 1 | ___ | ___ | ☐ ☐ |
| 7. Final Escalation | 1 | ___ | ___ | ☐ ☐ |
| 8. Task Resolution | 2 | ___ | ___ | ☐ ☐ |
| 9. Manager Login | 2 | ___ | ___ | ☐ ☐ |
| 10. Edge Cases | 4 | ___ | ___ | ☐ ☐ |
| 11. DB Integrity | 2 | ___ | ___ | ☐ ☐ |
| 12. Performance | 2 | ___ | ___ | ☐ ☐ |
| **TOTAL** | **28** | **___** | **___** | **__%** |

---

## 🐛 BUGS FOUND

### Bug #1
**Title**: _______________________________________________  
**Severity**: ☐ CRITICAL ☐ HIGH ☐ MEDIUM ☐ LOW  
**Description**: _______________________________________________  
**Steps to Reproduce**: _______________________________________________  
**Expected**: _______________________________________________  
**Actual**: _______________________________________________  
**Status**: ☐ NEW ☐ ASSIGNED ☐ IN PROGRESS ☐ RESOLVED  

---

### Bug #2
**Title**: _______________________________________________  
**Severity**: ☐ CRITICAL ☐ HIGH ☐ MEDIUM ☐ LOW  
**Description**: _______________________________________________  
**Steps to Reproduce**: _______________________________________________  
**Expected**: _______________________________________________  
**Actual**: _______________________________________________  
**Status**: ☐ NEW ☐ ASSIGNED ☐ IN PROGRESS ☐ RESOLVED  

---

## ✅ SIGN-OFF

**Tested By**: _______________________________________________  
**Date**: _______________________________________________  
**Overall Status**: ☐ PASS ☐ PASS WITH MINOR ISSUES ☐ FAIL  

**Recommendation**:
- [ ] Ready for Production
- [ ] Ready for Production with Minor Fixes
- [ ] Not Ready for Production

**Comments**: _______________________________________________

**Manager Approval**: _______________________________________________

---

**End of Testing Checklist**  
**Last Updated**: May 15, 2026

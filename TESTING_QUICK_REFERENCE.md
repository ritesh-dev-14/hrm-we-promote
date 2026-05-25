# ⚡ ESCALATION FEATURE - QUICK REFERENCE CARD

**Print this page or bookmark it during testing!**

---

## 🎯 Quick Test Commands

### 1️⃣ Trigger Daily Check (Immediately Create Escalations)
```bash
curl -X POST http://localhost:8000/api/escalations/check/manual \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```
**Expected**: `"success": true` | Check for escalations in DB

---

### 2️⃣ View All Pending Escalations
```bash
curl -X GET http://localhost:8000/api/escalations/pending \
  -H "Authorization: Bearer MANAGER_TOKEN"
```
**Look for**: Employee names and escalation dates

---

### 3️⃣ Check Escalation Statistics
```bash
curl -X GET http://localhost:8000/api/escalations/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
**Shows**: Total | Pending | Resolved | HR/Admin Escalated

---

### 4️⃣ Assign Task to Resolve Escalation
```bash
curl -X POST http://localhost:8000/api/task/create \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMPLOYEE_ID",
    "taskTitle": "Sample Task",
    "workDate": "2026-05-16",
    "priority": "HIGH"
  }'
```
**Result**: Escalation should auto-resolve

---

## 🗄️ Quick Database Queries

### Check Current Escalations
```sql
SELECT emp.name, e.status, e.escalationDate 
FROM taskEscalation e 
JOIN "User" emp ON e.employeeId = emp.id 
WHERE e.status != 'RESOLVED' 
ORDER BY e.createdAt DESC;
```

### Check if Reminders Were Sent
```sql
SELECT 
  CASE WHEN reminder1SentAt IS NOT NULL THEN '✓ 1PM' ELSE '✗ 1PM' END,
  CASE WHEN reminder2SentAt IS NOT NULL THEN '✓ 2PM' ELSE '✗ 2PM' END,
  CASE WHEN reminder3SentAt IS NOT NULL THEN '✓ 2:30PM' ELSE '✗ 2:30PM' END,
  CASE WHEN hrEscalatedAt IS NOT NULL THEN '✓ 3PM' ELSE '✗ 3PM' END,
  CASE WHEN adminEscalatedAt IS NOT NULL THEN '✓ 4PM' ELSE '✗ 4PM' END
FROM taskEscalation WHERE id = 'ESCALATION_ID';
```

### Count Escalations by Status
```sql
SELECT status, COUNT(*) FROM taskEscalation GROUP BY status;
```

### Check Email Notifications Sent
```sql
SELECT type, COUNT(*) FROM notification 
WHERE type LIKE '%ESCALATION%' 
GROUP BY type;
```

---

## 📊 Test Timeline

| Time | What to Check | Where |
|------|---|---|
| **12:59 AM** | Daily detection job runs | Backend logs |
| **1:00 PM** | Manager email + pop-up | Email inbox + Browser |
| **2:00 PM** | Second reminder | Email inbox + Browser |
| **2:30 PM** | Third reminder (urgent) | Email inbox + Browser |
| **3:00 PM** | HR notification | HR Email + Browser |
| **4:00 PM** | Admin notification | Admin Email + Browser |
| **6:00 PM** | Final escalation | HR & Admin Email |
| **Anytime** | Task assignment | Escalation resolves |

---

## 🔍 Browser Console Checks

### Check WebSocket Connection
```javascript
// In browser console:
console.log(socket)  // Should show active Socket.io connection
console.log(socket.id)  // Should have session ID
```

### Listen for Escalation Events
```javascript
// In browser console:
socket.on('escalation_reminder_1', (data) => console.log('Reminder 1:', data));
socket.on('escalation_reminder_2', (data) => console.log('Reminder 2:', data));
socket.on('escalation_reminder_3', (data) => console.log('Reminder 3:', data));
socket.on('escalation_hr', (data) => console.log('HR:', data));
socket.on('escalation_admin', (data) => console.log('Admin:', data));
```

---

## 📧 Email Verification Checklist

For each reminder/escalation received, verify:

- [ ] Email sent to correct recipient (Manager/HR/Admin)
- [ ] Subject line is clear and relevant
- [ ] Body contains employee name
- [ ] Body contains escalation date/time
- [ ] Contains action link/button
- [ ] Professional formatting
- [ ] No typos or broken links
- [ ] Timestamps are accurate

---

## 💾 Essential Terminals/Tabs

Keep these OPEN during testing:

1. **Backend Console**
   ```bash
   cd backend && npm run dev
   ```
   Watch for: Cron job messages at scheduled times

2. **Frontend Console**
   ```bash
   cd frontend && npm run dev
   ```
   Open at: http://localhost:5173

3. **Database Console**
   ```bash
   psql -U postgres -d we_promote
   ```
   Run: Quick database queries

4. **Email Service**
   Open test email inbox in browser

5. **DevTools**
   Press: F12 in browser | Monitor Console for WebSocket events

---

## ✅ Test Case Quick Reference

| # | Test | Time | Expected | Status |
|---|------|------|----------|--------|
| 1 | Daily detection creates escalations | Immediate | 2+ escalations | ☐ |
| 2 | Manager gets 1st email | 1:00 PM | Email received | ☐ |
| 3 | Pop-up appears 1st time | 1:00 PM | Yellow pop-up | ☐ |
| 4 | Manager gets 2nd email | 2:00 PM | Email received | ☐ |
| 5 | Pop-up appears 2nd time | 2:00 PM | Orange pop-up | ☐ |
| 6 | Manager gets 3rd email | 2:30 PM | Email received | ☐ |
| 7 | Pop-up appears 3rd time | 2:30 PM | Red pop-up | ☐ |
| 8 | HR gets email | 3:00 PM | Email received | ☐ |
| 9 | HR sees pop-up | 3:00 PM | Critical pop-up | ☐ |
| 10 | Admin gets email | 4:00 PM | Email received | ☐ |
| 11 | Admin sees pop-up | 4:00 PM | Critical pop-up | ☐ |
| 12 | Final escalation email | 6:00 PM | Email received | ☐ |
| 13 | Task assignment resolves | Immediate | Status = RESOLVED | ☐ |
| 14 | Manager sees pop-up at login | Login | Unresolved escalations shown | ☐ |
| 15 | APIs work correctly | Immediate | 200 responses | ☐ |

---

## 🐛 Quick Bug Report

**Found a bug? Fill this out:**

```
BUG: _________________________________
SEVERITY: ☐ CRITICAL ☐ HIGH ☐ MEDIUM ☐ LOW
WHEN: ________________________________
HOW TO REPEAT: 
1. _________________________________
2. _________________________________
3. _________________________________

EXPECTED: ______________________________
ACTUAL: ________________________________
SCREENSHOT: ☐ YES ☐ NO
```

---

## 🚨 Troubleshooting Guide

| Problem | Solution |
|---------|----------|
| No pop-ups appearing | Check browser console for errors | F12 |
| Emails not received | Verify .env MAIL settings | Check /backend/.env |
| Cron jobs not running | Restart backend | npm run dev |
| WebSocket disconnected | Refresh browser | Ctrl+R |
| Task won't assign | Check employeeId is correct | Verify in DB |
| Escalation not resolving | Check task workDate is future date | Should be tomorrow+ |
| Database error | Run migrations | npx prisma migrate dev |

---

## 🎯 Success = All ✅

```
✅ Daily detection works
✅ All 3 manager reminders sent
✅ HR escalation at 3 PM
✅ Admin escalation at 4 PM
✅ Final escalation at 6 PM
✅ Task assignment resolves
✅ Pop-ups appear on frontend
✅ Emails received correctly
✅ Database state accurate
✅ APIs responding correctly
✅ Manager sees login pop-up
✅ No critical bugs
```

---

## 📞 Escalation Contact

If you find CRITICAL bugs:
1. Document in template above
2. Take screenshot
3. Alert development team IMMEDIATELY
4. Do NOT proceed with production release

---

## 💡 Pro Tips

- 💾 **Save test data**: Keep manager/employee IDs for reference
- 📧 **Watch email in real-time**: Use Mailtrap dashboard
- 🔍 **Monitor DB live**: Keep query running in another window
- 📹 **Record videos**: For complex bug reproduction
- ⏰ **Set alarms**: For critical times (1 PM, 3 PM, etc.)
- 📝 **Take notes**: Document any delays or anomalies

---

**Good Luck! You've got this! 🚀**

---

**Last Updated**: May 15, 2026  
**Version**: 1.0 - Quick Reference Edition

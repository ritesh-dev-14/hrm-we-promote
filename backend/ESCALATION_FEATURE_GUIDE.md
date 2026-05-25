# Task Assignment Escalation Feature - Implementation Guide

## 📋 Overview

This feature automatically monitors manager task assignments and escalates through multiple notification channels when tasks are not assigned within specified timeframes.

## 🚀 Quick Setup

### 1. Install Dependencies (Already Done)
- `node-cron` - For scheduling jobs
- `socket.io` - For real-time notifications
- `nodemailer` - For email notifications

### 2. Update Environment Variables

Add these to your `.env` file:

```env
# Mail Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=noreply@wepromotehR.com
APP_URL=http://localhost:5173

# Frontend URL (for Socket.io CORS)
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/we-promote
```

### 3. Create Prisma Migration (OPTIONAL - Schema Already Updated)

```bash
cd backend
npx prisma migrate dev --name add_escalation_type_field
npx prisma generate
```

### 4. Start the Server

```bash
cd backend
npm run dev
```

The server will automatically:
- ✅ Initialize Socket.io on WebSocket connection
- ✅ Schedule all 7 cron jobs
- ✅ Connect to database
- ✅ Start listening for events

Check console for output like:
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

## 📊 Feature Workflow

### Daily Check (12:59 AM)
```
Every day at 12:59 AM:
  For each manager with employees:
    Check if any employee has NO tasks for:
      - Tomorrow (next 1 day)
      - 4 days from now
    If NO tasks found:
      Create TaskEscalation record with status=PENDING
```

### Manager Reminders (1 PM, 2 PM, 2:30 PM)
```
For each PENDING escalation:
  If reminder NOT already sent:
    1. Send EMAIL to manager
    2. Create IN-APP NOTIFICATION
    3. Emit WEBSOCKET event (pop-up)
    4. Update escalation record with timestamp
```

### HR Escalation (3 PM)
```
For each PENDING escalation with NO task assigned yet:
  If HR not already escalated:
    1. Send EMAIL to all HR users
    2. Create IN-APP NOTIFICATION
    3. Emit WEBSOCKET event
    4. Update status to HR_ESCALATED
```

### Admin Escalation (4 PM)
```
For each unresolved escalation:
  If Admin not already escalated:
    1. Send EMAIL to all ADMIN users
    2. Create IN-APP NOTIFICATION
    3. Emit WEBSOCKET event
    4. Update status to ADMIN_ESCALATED
```

### Final Escalation (6 PM)
```
For each STILL unresolved escalation:
    1. Send EMAIL to HR + ADMIN
    2. Create IN-APP NOTIFICATION
    3. Emit WEBSOCKET event
    4. Update status to FINAL_ESCALATED
```

## 🔗 API Endpoints

### Get Pending Escalations
```bash
GET /api/escalations/pending
Headers: Authorization: Bearer <token>
Response: { success: true, count: 5, data: [...] }
```

### Get Manager's Escalation History
```bash
GET /api/escalations/manager/:managerId/history
Headers: Authorization: Bearer <token>
Response: { success: true, count: 10, data: [...] }
```

### Get Escalation Statistics (HR/ADMIN ONLY)
```bash
GET /api/escalations/stats
Response: {
  total: 50,
  pending: 5,
  managerNotified: 10,
  hrEscalated: 15,
  adminEscalated: 10,
  finalEscalated: 2,
  resolved: 8
}
```

### Resolve Escalation (Mark as Resolved)
```bash
POST /api/escalations/:escalationId/resolve
Headers: Authorization: Bearer <token>
Response: { success: true, message: "Escalation resolved successfully" }
```

### Manual Check Trigger (ADMIN ONLY)
```bash
POST /api/escalations/check/manual
Headers: Authorization: Bearer <token>
Response: { success: true, message: "Manual task assignment check completed" }
```

## 🎯 Frontend Integration

### 1. Add EscalationAlert Component to App

```jsx
import { useEscalationNotifications } from "./hooks/useEscalationNotifications";
import EscalationAlert from "./components/EscalationAlert";

function App() {
  const { currentNotification, clearNotification } = useEscalationNotifications(
    userId,
    isLoggedIn
  );

  return (
    <>
      {/* Your existing app content */}
      
      {currentNotification && (
        <EscalationAlert
          notification={currentNotification}
          onClose={clearNotification}
        />
      )}
    </>
  );
}
```

### 2. Use Escalation API in Components

```jsx
import { getPendingEscalations } from "./services/escalationApi";

async function EscalationDashboard() {
  const escalations = await getPendingEscalations();
  // Display escalations...
}
```

## 📧 Email Templates

### Manager Reminder Email
- **To:** Manager
- **Subject:** ⏰ Task Assignment Reminder #1 - Employee Name
- **Content:** 
  - Employee name
  - Missing date
  - Action link to application
  - Escalation warning

### HR/Admin Escalation Email
- **To:** All HR/Admin users
- **Subject:** 🚨 HR ALERT: Task Assignment Not Completed
- **Content:**
  - Manager & Employee names
  - Escalation level
  - Urgency message
  - Link to system

## 🔔 Notification Types

| Type | Channel | Trigger |
|------|---------|---------|
| MANAGER_REMINDER | Email + In-App + Pop-up | 1 PM, 2 PM, 2:30 PM |
| HR_ESCALATION | Email + In-App + Pop-up | 3 PM (if not assigned) |
| ADMIN_ESCALATION | Email + In-App + Pop-up | 4 PM (if not assigned) |
| FINAL_ESCALATION | Email + In-App + Pop-up | 6 PM (if not assigned) |

## 🛠️ Testing

### Test Daily Check Manually

```bash
curl -X POST http://localhost:8000/api/escalations/check/manual \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Check Escalation Stats

```bash
curl http://localhost:8000/api/escalations/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View Pending Escalations

```bash
curl http://localhost:8000/api/escalations/pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📱 Socket.io Events

### Client to Server
```javascript
// Join user notification room
socket.emit('join-user', { userId: '123' });

// Leave user notification room
socket.emit('leave-user', { userId: '123' });
```

### Server to Client
```javascript
// Task reminder
socket.on('task-reminder-popup', (data) => {
  // { type, title, message, level, timestamp }
});

// HR escalation
socket.on('hr-escalation-popup', (data) => {
  // { type, title, message, level, managerId, timestamp }
});

// Admin escalation
socket.on('admin-escalation-popup', (data) => {
  // { type, title, message, level, managerId, timestamp }
});

// Final escalation
socket.on('final-escalation-popup', (data) => {
  // { type, title, message, level, managerId, recipientRole, timestamp }
});
```

## 🔄 Auto-Resolve Escalations

When a task is assigned, automatically resolve related escalations:

```javascript
import { autoResolveEscalation } from "../utils/escalationHelper";

// In your task creation/assignment endpoint:
await autoResolveEscalation(managerId, employeeId, taskDate);
```

## 🎨 Notification Levels

- **Info (Blue):** Standard task reminders
- **Warning (Orange):** Final manager reminder
- **Danger (Red):** HR escalation
- **Critical (Dark Red):** Admin/Final escalation

## 📊 Database Schema

### TaskEscalation Model

```prisma
model TaskEscalation {
  id String @id @default(uuid())
  employeeId String
  managerId String
  escalationDate DateTime
  type EscalationType  // NEXT_DAY_MISSING or FUTURE_4_DAYS_MISSING
  status EscalationStatus
  
  reminder1SentAt DateTime?  // 1 PM
  reminder2SentAt DateTime?  // 2 PM
  reminder3SentAt DateTime?  // 2:30 PM
  hrEscalatedAt DateTime?    // 3 PM
  adminEscalatedAt DateTime? // 4 PM
  finalEscalatedAt DateTime? // 6 PM
  resolvedAt DateTime?
  
  managerMailSent Boolean @default(false)
  hrMailSent Boolean @default(false)
  adminMailSent Boolean @default(false)
  popupSent Boolean @default(false)
  
  createdAt DateTime @default(now())
  employee User @relation("EmployeeEscalation", fields: [employeeId], references: [id])
  manager User @relation("ManagerEscalation", fields: [managerId], references: [id])
}
```

## ⚙️ Configuration Options

### Adjust Cron Schedules

Edit `src/jobs/escalationJobs.js` to change times:

```javascript
// Change from 1:00 PM (13:00) to 1:30 PM (13:30)
cron.schedule("30 13 * * *", async () => {
  // Your job logic
});
```

### Cron Time Format: `"minute hour day month dayOfWeek"`

```
"0 13 * * *"     = 1:00 PM daily
"30 14 * * *"    = 2:30 PM daily
"0 15 * * 1-5"   = 3:00 PM on weekdays only
"0 0 1 * *"      = Midnight on 1st of month
```

## 🐛 Troubleshooting

### Issue: Jobs not running
**Solution:** Check server logs for "SETTING UP ESCALATION JOBS" message. Ensure node-cron is installed.

### Issue: No email sent
**Solution:** Verify MAIL_* environment variables and SMTP credentials are correct.

### Issue: Pop-ups not showing
**Solution:** Ensure Socket.io is connected (check browser console) and user has joined their room.

### Issue: Escalations not resolving
**Solution:** Call `autoResolveEscalation()` when task is assigned. Check database for TaskAssignment records.

## 📝 Logs to Monitor

Look for these log patterns to verify functionality:

```
✅ Connected to notification server        // Socket.io connected
📧 Email sent to manager@example.com       // Email sent
🔔 In-app notification created for Manager  // Notification created
📢 WebSocket pop-up sent to manager         // Pop-up sent
🚨 HR escalation sent to HR user           // HR notified
✅ Escalations auto-resolved               // Task resolved escalation
```

## 🚨 Production Checklist

- [ ] Update `APP_URL` environment variable
- [ ] Configure production email credentials
- [ ] Test with real email service (not Gmail for bulk)
- [ ] Monitor escalation stats regularly
- [ ] Set up admin dashboard for escalation monitoring
- [ ] Create backup for escalation history
- [ ] Test Socket.io with HTTPS/WSS
- [ ] Document escalation procedures for HR/Admin
- [ ] Set timezone to match server location

## 📞 Support

For issues or questions about this feature implementation, refer to:
- Job logs in `src/jobs/escalationJobs.js`
- Service logic in `src/services/escalationService.js`
- API errors from `src/modules/escalation/escalation.routes.js`

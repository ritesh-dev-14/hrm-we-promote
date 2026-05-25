# 🏗️ Task Escalation Architecture & System Design

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TASK ESCALATION SYSTEM                          │
└─────────────────────────────────────────────────────────────────────────┘

                              DAILY SCHEDULE
                         
                         ┌─────────────────────┐
                         │   12:59 AM (Daily)  │
                         │  Detection Job      │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │  Check Missing Assignments   │
                    │  - Tomorrow (1 day)          │
                    │  - Future (4 days)           │
                    └──────────────┬────────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │  Create TaskEscalation       │
                    │  Records                     │
                    └──────────────┬────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│                    ESCALATION NOTIFICATION FLOW                      │
└──────────────────────────────────▼──────────────────────────────────┘

    1:00 PM                 2:00 PM               2:30 PM
    ┌─────────┐             ┌─────────┐          ┌─────────┐
    │Reminder │   ────→     │Reminder │  ────→   │Reminder │
    │   #1    │             │   #2    │          │   #3    │
    │MANAGER  │             │MANAGER  │          │MANAGER  │
    └────┬────┘             └────┬────┘          └────┬────┘
         │                       │                    │
         └───────────────────────┴────────────────────┘
                                 │
                    ┌────────────▼──────────┐
                    │  Task Assigned?       │
                    │  (Check DB)           │
                    └────────┬───────┬──────┘
                             │       │
                        NO   │       │   YES
                             │       │
                    ┌────────▼─┐  ┌─▼────────────────┐
                    │ 3:00 PM  │  │ AUTO-RESOLVE     │
                    │ HR       │  │ Escalation       │
                    │Escalation   │ Stop notifications
                    │            │
                    └────────┬─┘  └──────────────────┘
                             │
                    ┌────────▼──────────┐
                    │  Task Assigned?   │
                    └────────┬───────┬──┘
                             │       │
                        NO   │       │   YES
                             │       │
                    ┌────────▼─┐  ┌─▼────────────────┐
                    │ 4:00 PM  │  │ AUTO-RESOLVE     │
                    │ Admin    │  │ Stop all alerts  │
                    │Escalation   │
                    │            │
                    └────────┬─┘  └──────────────────┘
                             │
                    ┌────────▼──────────┐
                    │  Task Assigned?   │
                    └────────┬───────┬──┘
                             │       │
                        NO   │       │   YES
                             │       │
                    ┌────────▼─┐  ┌─▼────────────────┐
                    │ 6:00 PM  │  │ AUTO-RESOLVE     │
                    │ FINAL    │  │ End of day alert │
                    │ESCALATION   │
                    │(HR+Admin)   │
                    └────────┘  └──────────────────┘

    
┌─────────────────────────────────────────────────────────────────────┐
│              NOTIFICATION DELIVERY CHANNELS (All Levels)            │
└─────────────────────────────────────────────────────────────────────┘

    ┌─ Email Notification
    │  ├─ Manager Template (Reminders)
    │  ├─ HR/Admin Template (Escalations)
    │  └─ Sent via Nodemailer (SMTP)
    │
    ├─ In-App Notification
    │  ├─ Stored in Notification model
    │  ├─ Viewable in notification center
    │  └─ Includes timestamp & level
    │
    └─ WebSocket Pop-up
       ├─ Real-time via Socket.io
       ├─ Auto-dismisses based on level
       ├─ Info: 10s, Warning: 15s, Critical: 20s
       └─ Stacks multiple notifications


┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE RELATIONSHIPS                         │
└─────────────────────────────────────────────────────────────────────┘

    User (Manager)
        ├─ subordinates: User[] (Employees)
        └─ managerEscalations: TaskEscalation[]
        
    User (Employee)
        ├─ managerId: User (Manager)
        └─ employeeEscalations: TaskEscalation[]
    
    TaskEscalation
        ├─ manager: User
        ├─ employee: User
        ├─ escalationDate: DateTime
        ├─ type: NEXT_DAY_MISSING | FUTURE_4_DAYS_MISSING
        ├─ status: PENDING | ... | RESOLVED
        └─ timestamps: reminder1SentAt, reminder2SentAt, etc.
    
    TaskAssignment
        ├─ task: Task
        ├─ employee: User
        └─ workDate: DateTime (checked by detection)
    
    Notification
        ├─ user: User (Manager/HR/Admin)
        ├─ message: String
        └─ type: MANAGER_REMINDER | HR_ESCALATION | etc.


┌─────────────────────────────────────────────────────────────────────┐
│                    CRON JOB SCHEDULE (Times in 24h)                │
└─────────────────────────────────────────────────────────────────────┘

Job                    Time        Cron Pattern    Function
─────────────────────────────────────────────────────────────────────
Detection              12:59 AM    "59 0 * * *"    Create escalations
Manager Reminder #1    1:00 PM     "0 13 * * *"    Send 1st reminder
Manager Reminder #2    2:00 PM     "0 14 * * *"    Send 2nd reminder
Manager Reminder #3    2:30 PM     "30 14 * * *"   Send 3rd reminder
HR Escalation          3:00 PM     "0 15 * * *"    Escalate to HR
Admin Escalation       4:00 PM     "0 16 * * *"    Escalate to Admin
Final Escalation       6:00 PM     "0 18 * * *"    Final notification


┌─────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION RECIPIENTS                           │
└─────────────────────────────────────────────────────────────────────┘

Manager Reminders (1 PM, 2 PM, 2:30 PM)
    └─ TO: User with role=MANAGER
    └─ WHO: The manager who created task
    └─ WHAT: Reminder to assign task to specific employee

HR Escalation (3 PM)
    └─ TO: All users with role=HR
    └─ WHO: All HR personnel
    └─ WHAT: Alert that manager hasn't assigned task

Admin Escalation (4 PM)
    └─ TO: All users with role=ADMIN
    └─ WHO: All admin personnel
    └─ WHAT: Critical alert, HR also informed

Final Escalation (6 PM)
    └─ TO: All users with role=HR AND ADMIN
    └─ WHO: All HR + Admin personnel
    └─ WHAT: Final critical notification


┌─────────────────────────────────────────────────────────────────────┐
│                      API ENDPOINT FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

Frontend Request
    │
    ├─ GET /api/escalations/pending
    │  ├─ Auth check
    │  ├─ Query database
    │  └─ Return escalations for user
    │
    ├─ POST /api/escalations/:id/resolve
    │  ├─ Auth check
    │  ├─ Verify user ownership
    │  ├─ Update escalation.status = RESOLVED
    │  └─ Set resolvedAt timestamp
    │
    ├─ GET /api/escalations/stats
    │  ├─ Auth check (HR/Admin only)
    │  ├─ Count by status
    │  └─ Return statistics
    │
    └─ POST /api/escalations/check/manual
       ├─ Auth check (Admin only)
       ├─ Call detection service
       └─ Return result


┌─────────────────────────────────────────────────────────────────────┐
│                    SOCKET.IO REAL-TIME FLOW                         │
└─────────────────────────────────────────────────────────────────────┘

Client Connect
    │
    ├─ emit 'join-user' { userId }
    │  └─ Client joins room: user-{userId}
    │
    │ [Ready to receive notifications]
    │
    ├─ Server: send 'task-reminder-popup'
    │  ├─ emit to io.to(`user-${managerId}`)
    │  └─ Client receives → Display pop-up
    │
    ├─ Server: send 'hr-escalation-popup'
    │  ├─ emit to io.to(`user-${hrId}`)
    │  └─ Client receives → Display pop-up
    │
    └─ Server: send 'admin-escalation-popup'
       ├─ emit to io.to(`user-${adminId}`)
       └─ Client receives → Display pop-up


┌─────────────────────────────────────────────────────────────────────┐
│                   AUTO-RESOLVE MECHANISM                            │
└─────────────────────────────────────────────────────────────────────┘

Task Assignment Created
    │
    ├─ Save TaskAssignment to database
    │
    └─ Call autoResolveEscalation(managerId, employeeId, taskDate)
       │
       ├─ Query TaskEscalation records matching:
       │  ├─ managerId
       │  ├─ employeeId
       │  ├─ escalationDate = taskDate
       │  └─ status = PENDING or MANAGER_NOTIFIED etc
       │
       └─ Update all matching records:
          ├─ status = RESOLVED
          ├─ resolvedAt = now()
          └─ Stop all future notifications for this escalation


┌─────────────────────────────────────────────────────────────────────┐
│                     ERROR HANDLING FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

Job Execution
    │
    ├─ Try
    │  ├─ Execute job logic
    │  └─ Log success
    │
    └─ Catch
       ├─ Log error with timestamp
       ├─ Don't break next job
       └─ Continue with other escalations


┌─────────────────────────────────────────────────────────────────────┐
│                  ESCALATION LIFECYCLE                               │
└─────────────────────────────────────────────────────────────────────┘

CREATED
  │ (status=PENDING)
  │
  ├─→ MANAGER_NOTIFIED
  │    (1 PM, 2 PM, 2:30 PM reminders sent)
  │
  ├─→ HR_ESCALATED
  │    (3 PM - HR notified)
  │
  ├─→ ADMIN_ESCALATED
  │    (4 PM - Admin notified)
  │
  ├─→ FINAL_ESCALATED
  │    (6 PM - HR + Admin final alert)
  │
  └─→ RESOLVED
       (Task assigned - escalation stops)
       OR (Manual override)

```

---

## 🔄 Data Flow Example

```
Day 1: May 15, 2026 (Wednesday)

12:59 AM
├─ Manager John has employees: Alice, Bob
├─ Check: Do John's employees have tasks for May 16?
└─ Result: Alice has NO task
   └─ Create TaskEscalation:
      ├─ employeeId: Alice
      ├─ managerId: John
      ├─ escalationDate: May 16
      ├─ type: NEXT_DAY_MISSING
      └─ status: PENDING

1:00 PM
├─ Found 1 PENDING escalation for Alice
├─ John's email: "You haven't assigned tasks to Alice for May 16"
├─ Create Notification for John
├─ Emit WebSocket event
└─ Update reminder1SentAt = 1:00 PM

1:45 PM
├─ John assigns task to Alice
├─ autoResolveEscalation() called
├─ TaskEscalation status = RESOLVED
└─ resolvedAt = 1:45 PM
   └─ NO 2 PM, 3 PM, 4 PM reminders sent! ✅

2:00 PM
├─ Job looks for PENDING escalations
├─ Alice's escalation is RESOLVED (not PENDING)
└─ Skip notification ✅

END OF DAY
└─ Escalation lifecycle complete ✅
```

---

## 🎯 Key Design Decisions

1. **Per-Employee Escalation**: Each employee gets individual escalation tracking
2. **Idempotent Jobs**: Safe to run multiple times
3. **Auto-Resolve**: Stops cascade when task is assigned
4. **Multiple Channels**: Email + In-App + WebSocket for reliability
5. **Status Tracking**: Know exactly at which escalation level issue is
6. **Timestamp Tracking**: Audit trail of all actions
7. **Role-Based Access**: Only HR/Admin can see all escalations

---

## 📈 Scaling Considerations

For 100+ managers with 1000+ employees:
- Database indexes on `managerId`, `status`, `escalationDate`
- Batch processing for notification sending
- Email queue system (optional: Bull, Bee-Queue)
- Redis caching for frequently accessed data
- Load balance Socket.io with Redis adapter


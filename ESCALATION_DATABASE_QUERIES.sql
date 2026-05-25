-- ======================================================================
-- 🔍 ESCALATION FEATURE - DATABASE VERIFICATION QUERIES
-- ======================================================================
-- Use these SQL queries to verify the escalation system is working correctly
-- Database: PostgreSQL (we-promote)
-- Date: May 15, 2026
-- ======================================================================

-- ======================================================================
-- SECTION 1: DATA STRUCTURE VERIFICATION
-- ======================================================================

-- 1.1 Verify TaskEscalation table exists and has correct structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'taskEscalation'
ORDER BY ordinal_position;

-- Expected columns:
-- id (UUID)
-- employeeId (UUID, FK)
-- managerId (UUID, FK)
-- escalationDate (TIMESTAMP)
-- type (VARCHAR) - NEXT_DAY_MISSING, FUTURE_4_DAYS_MISSING
-- status (VARCHAR) - PENDING, MANAGER_NOTIFIED, HR_ESCALATED, ADMIN_ESCALATED, FINAL_ESCALATED, RESOLVED
-- reminder1SentAt (TIMESTAMP, nullable)
-- reminder2SentAt (TIMESTAMP, nullable)
-- reminder3SentAt (TIMESTAMP, nullable)
-- hrEscalatedAt (TIMESTAMP, nullable)
-- adminEscalatedAt (TIMESTAMP, nullable)
-- finalEscalatedAt (TIMESTAMP, nullable)
-- resolvedAt (TIMESTAMP, nullable)
-- createdAt (TIMESTAMP)
-- updatedAt (TIMESTAMP)

---

-- 1.2 Verify Notification table structure for escalation notifications
SELECT DISTINCT type FROM notification WHERE type LIKE '%ESCALATION%' LIMIT 10;

-- Expected types: ESCALATION_REMINDER_1, ESCALATION_REMINDER_2, ESCALATION_REMINDER_3, ESCALATION_HR, ESCALATION_ADMIN, ESCALATION_FINAL

---

-- ======================================================================
-- SECTION 2: CURRENT STATE INSPECTION
-- ======================================================================

-- 2.1 View ALL pending escalations (Real-time Dashboard)
SELECT 
    e.id as escalation_id,
    e.escalationDate,
    e.type,
    e.status,
    emp.name as employee_name,
    emp.employeeId as employee_id,
    mgr.name as manager_name,
    mgr.employeeId as manager_id,
    CASE 
        WHEN e.reminder1SentAt IS NOT NULL THEN '✅ 1PM'
        ELSE '⏳ Pending'
    END as reminder_1pm,
    CASE 
        WHEN e.reminder2SentAt IS NOT NULL THEN '✅ 2PM'
        ELSE '⏳ Pending'
    END as reminder_2pm,
    CASE 
        WHEN e.reminder3SentAt IS NOT NULL THEN '✅ 2:30PM'
        ELSE '⏳ Pending'
    END as reminder_2_30pm,
    CASE 
        WHEN e.hrEscalatedAt IS NOT NULL THEN '✅ 3PM'
        ELSE '⏳ Pending'
    END as hr_escalation_3pm,
    CASE 
        WHEN e.adminEscalatedAt IS NOT NULL THEN '✅ 4PM'
        ELSE '⏳ Pending'
    END as admin_escalation_4pm,
    CASE 
        WHEN e.finalEscalatedAt IS NOT NULL THEN '✅ 6PM'
        ELSE '⏳ Pending'
    END as final_escalation_6pm,
    COALESCE(EXTRACT(EPOCH FROM (NOW() - e.createdAt))::INTEGER / 3600, 0) as hours_pending
FROM taskEscalation e
JOIN "User" emp ON e.employeeId = emp.id
JOIN "User" mgr ON e.managerId = mgr.id
WHERE e.status IN ('PENDING', 'MANAGER_NOTIFIED', 'HR_ESCALATED', 'ADMIN_ESCALATED', 'FINAL_ESCALATED')
ORDER BY e.escalationDate DESC, e.createdAt DESC;

---

-- 2.2 Count escalations by status
SELECT 
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN reminder1SentAt IS NOT NULL THEN 1 END) as with_reminder_1,
    COUNT(CASE WHEN reminder2SentAt IS NOT NULL THEN 1 END) as with_reminder_2,
    COUNT(CASE WHEN reminder3SentAt IS NOT NULL THEN 1 END) as with_reminder_3,
    COUNT(CASE WHEN hrEscalatedAt IS NOT NULL THEN 1 END) as hr_escalated,
    COUNT(CASE WHEN adminEscalatedAt IS NOT NULL THEN 1 END) as admin_escalated,
    COUNT(CASE WHEN finalEscalatedAt IS NOT NULL THEN 1 END) as final_escalated,
    COUNT(CASE WHEN resolvedAt IS NOT NULL THEN 1 END) as resolved
FROM taskEscalation
GROUP BY status;

---

-- 2.3 Today's escalations summary
SELECT 
    DATE(e.escalationDate) as escalation_date,
    COUNT(*) as total_escalations,
    COUNT(CASE WHEN e.status = 'PENDING' THEN 1 END) as pending,
    COUNT(CASE WHEN e.status = 'MANAGER_NOTIFIED' THEN 1 END) as manager_notified,
    COUNT(CASE WHEN e.status = 'HR_ESCALATED' THEN 1 END) as hr_escalated,
    COUNT(CASE WHEN e.status = 'ADMIN_ESCALATED' THEN 1 END) as admin_escalated,
    COUNT(CASE WHEN e.status = 'RESOLVED' THEN 1 END) as resolved
FROM taskEscalation e
WHERE DATE(e.escalationDate) = CURRENT_DATE
GROUP BY DATE(e.escalationDate);

---

-- ======================================================================
-- SECTION 3: ESCALATION TIMELINE VERIFICATION
-- ======================================================================

-- 3.1 View complete timeline for a specific escalation
SELECT 
    e.id,
    e.escalationDate,
    e.type,
    e.status,
    emp.name as employee,
    mgr.name as manager,
    e.createdAt as 'Created At (Detection)',
    e.reminder1SentAt as 'Reminder 1 (1 PM)',
    e.reminder2SentAt as 'Reminder 2 (2 PM)',
    e.reminder3SentAt as 'Reminder 3 (2:30 PM)',
    e.hrEscalatedAt as 'HR Escalation (3 PM)',
    e.adminEscalatedAt as 'Admin Escalation (4 PM)',
    e.finalEscalatedAt as 'Final Escalation (6 PM)',
    e.resolvedAt as 'Resolved At',
    CASE 
        WHEN e.resolvedAt IS NOT NULL THEN EXTRACT(EPOCH FROM (e.resolvedAt - e.createdAt))::INTEGER
        ELSE EXTRACT(EPOCH FROM (NOW() - e.createdAt))::INTEGER
    END as time_to_resolution_seconds
FROM taskEscalation e
JOIN "User" emp ON e.employeeId = emp.id
JOIN "User" mgr ON e.managerId = mgr.id
ORDER BY e.createdAt DESC
LIMIT 10;

---

-- 3.2 Escalations resolved (Check resolution process)
SELECT 
    e.id,
    e.escalationDate,
    emp.name as employee,
    mgr.name as manager,
    e.status,
    e.resolvedAt,
    (e.resolvedAt - e.createdAt) as time_to_resolution,
    CASE 
        WHEN EXTRACT(EPOCH FROM (e.resolvedAt - e.createdAt)) < 3600 THEN 'Within 1 hour (Fast)'
        WHEN EXTRACT(EPOCH FROM (e.resolvedAt - e.createdAt)) < 7200 THEN 'Within 2 hours (Good)'
        ELSE 'More than 2 hours (Delayed)'
    END as resolution_speed
FROM taskEscalation e
JOIN "User" emp ON e.employeeId = emp.id
JOIN "User" mgr ON e.managerId = mgr.id
WHERE e.resolvedAt IS NOT NULL
ORDER BY e.resolvedAt DESC
LIMIT 20;

---

-- ======================================================================
-- SECTION 4: MANAGER PERFORMANCE TRACKING
-- ======================================================================

-- 4.1 Manager escalation statistics
SELECT 
    m.id,
    m.name as manager_name,
    m.employeeId,
    COUNT(DISTINCT e.id) as total_escalations,
    COUNT(DISTINCT CASE WHEN e.status = 'PENDING' THEN e.id END) as pending_escalations,
    COUNT(DISTINCT CASE WHEN e.resolvedAt IS NOT NULL THEN e.id END) as resolved_escalations,
    COUNT(DISTINCT CASE WHEN e.hrEscalatedAt IS NOT NULL THEN e.id END) as hr_escalations,
    COUNT(DISTINCT CASE WHEN e.adminEscalatedAt IS NOT NULL THEN e.id END) as admin_escalations,
    ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(e.resolvedAt, NOW()) - e.createdAt)))::NUMERIC / 3600, 2) as avg_resolution_hours,
    MAX(e.createdAt) as last_escalation_date
FROM "User" m
LEFT JOIN taskEscalation e ON m.id = e.managerId
WHERE m.role = 'MANAGER'
GROUP BY m.id, m.name, m.employeeId
ORDER BY COUNT(DISTINCT e.id) DESC;

---

-- 4.2 Manager with most unresolved escalations
SELECT 
    m.name as manager,
    COUNT(e.id) as unresolved_count,
    STRING_AGG(DISTINCT emp.name, ', ') as affected_employees,
    MIN(e.createdAt) as oldest_escalation
FROM "User" m
JOIN taskEscalation e ON m.id = e.managerId AND e.status != 'RESOLVED'
JOIN "User" emp ON e.employeeId = emp.id
GROUP BY m.id, m.name
ORDER BY unresolved_count DESC;

---

-- ======================================================================
-- SECTION 5: EMPLOYEE ESCALATION HISTORY
-- ======================================================================

-- 5.1 View all escalations for specific employee
-- Replace 'EMPLOYEE_ID_HERE' with actual employee UUID
SELECT 
    e.id,
    e.escalationDate,
    e.type,
    e.status,
    mgr.name as manager_name,
    e.createdAt,
    e.resolvedAt,
    CASE 
        WHEN e.resolvedAt IS NOT NULL THEN 'Resolved'
        WHEN e.finalEscalatedAt IS NOT NULL THEN 'To Admin'
        WHEN e.adminEscalatedAt IS NOT NULL THEN 'To Admin'
        WHEN e.hrEscalatedAt IS NOT NULL THEN 'To HR'
        WHEN e.reminder3SentAt IS NOT NULL THEN 'Reminder 3'
        WHEN e.reminder2SentAt IS NOT NULL THEN 'Reminder 2'
        WHEN e.reminder1SentAt IS NOT NULL THEN 'Reminder 1'
        ELSE 'Pending'
    END as current_stage
FROM taskEscalation e
JOIN "User" mgr ON e.managerId = mgr.id
WHERE e.employeeId = 'EMPLOYEE_ID_HERE'
ORDER BY e.escalationDate DESC;

---

-- ======================================================================
-- SECTION 6: NOTIFICATION TRACKING
-- ======================================================================

-- 6.1 Count escalation notifications sent
SELECT 
    type,
    COUNT(*) as count,
    COUNT(CASE WHEN isRead = true THEN 1 END) as read_count,
    COUNT(CASE WHEN isRead = false THEN 1 END) as unread_count,
    MAX(createdAt) as last_sent
FROM notification
WHERE type LIKE '%ESCALATION%'
GROUP BY type
ORDER BY count DESC;

---

-- 6.2 Unread escalation notifications for managers
SELECT 
    n.id,
    u.name as manager_name,
    n.type,
    n.message,
    n.createdAt,
    'UNREAD' as status
FROM notification n
JOIN "User" u ON n.userId = u.id
WHERE n.type LIKE '%ESCALATION%'
AND n.isRead = false
AND u.role = 'MANAGER'
ORDER BY n.createdAt DESC;

---

-- ======================================================================
-- SECTION 7: TASK ASSIGNMENT TRACKING
-- ======================================================================

-- 7.1 Check if tasks were assigned after escalations
SELECT 
    e.id as escalation_id,
    emp.name as employee,
    e.escalationDate,
    e.status,
    COUNT(ta.id) as tasks_assigned_after_escalation,
    MIN(ta.createdAt) as first_task_after_escalation,
    EXTRACT(EPOCH FROM (MIN(ta.createdAt) - e.createdAt))::INTEGER / 60 as minutes_to_assign_task
FROM taskEscalation e
JOIN "User" emp ON e.employeeId = emp.id
LEFT JOIN taskAssignment ta ON e.employeeId = ta.userId 
    AND e.managerId = ta.assignedBy
    AND ta.createdAt > e.createdAt
    AND DATE(ta.workDate) >= DATE(e.escalationDate)
WHERE e.status = 'RESOLVED'
GROUP BY e.id, emp.name, e.escalationDate, e.status
ORDER BY EXTRACT(EPOCH FROM (MIN(ta.createdAt) - e.createdAt)) DESC;

---

-- ======================================================================
-- SECTION 8: DATA QUALITY & CONSISTENCY CHECKS
-- ======================================================================

-- 8.1 Find orphaned escalations (escalation with non-existent employee/manager)
SELECT 
    e.id,
    e.employeeId,
    e.managerId,
    e.status,
    'ORPHANED EMPLOYEE' as issue
FROM taskEscalation e
LEFT JOIN "User" u_emp ON e.employeeId = u_emp.id
WHERE u_emp.id IS NULL

UNION ALL

SELECT 
    e.id,
    e.employeeId,
    e.managerId,
    e.status,
    'ORPHANED MANAGER' as issue
FROM taskEscalation e
LEFT JOIN "User" u_mgr ON e.managerId = u_mgr.id
WHERE u_mgr.id IS NULL;

---

-- 8.2 Escalations with impossible state transitions
-- (e.g., finalEscalatedAt before hrEscalatedAt)
SELECT 
    id,
    'Invalid Timeline' as issue
FROM taskEscalation
WHERE hrEscalatedAt > finalEscalatedAt
OR adminEscalatedAt > finalEscalatedAt
OR reminder1SentAt > reminder2SentAt
OR reminder2SentAt > reminder3SentAt
OR reminder3SentAt > hrEscalatedAt;

---

-- 8.3 Escalations marked resolved but with null resolvedAt
SELECT 
    id,
    status,
    resolvedAt,
    'Status/Timestamp Mismatch' as issue
FROM taskEscalation
WHERE status = 'RESOLVED' AND resolvedAt IS NULL;

---

-- ======================================================================
-- SECTION 9: PERFORMANCE & OPTIMIZATION CHECKS
-- ======================================================================

-- 9.1 Check if indexes are in place
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'taskEscalation'
ORDER BY indexname;

-- Expected indexes:
-- - taskEscalation_managerId
-- - taskEscalation_employeeId
-- - taskEscalation_status
-- - taskEscalation_escalationDate

---

-- 9.2 Find slow queries (escalations taking long to resolve)
SELECT 
    e.id,
    emp.name as employee,
    mgr.name as manager,
    EXTRACT(EPOCH FROM (COALESCE(e.resolvedAt, NOW()) - e.createdAt))::INTEGER / 3600 as hours_pending,
    CASE 
        WHEN EXTRACT(EPOCH FROM (COALESCE(e.resolvedAt, NOW()) - e.createdAt)) > 86400 THEN '🔴 CRITICAL (>24h)'
        WHEN EXTRACT(EPOCH FROM (COALESCE(e.resolvedAt, NOW()) - e.createdAt)) > 28800 THEN '🟠 WARNING (>8h)'
        ELSE '✅ NORMAL'
    END as performance
FROM taskEscalation e
JOIN "User" emp ON e.employeeId = emp.id
JOIN "User" mgr ON e.managerId = mgr.id
WHERE e.status NOT IN ('RESOLVED')
ORDER BY EXTRACT(EPOCH FROM (NOW() - e.createdAt)) DESC;

---

-- ======================================================================
-- SECTION 10: MANUAL VERIFICATION QUERIES
-- ======================================================================

-- 10.1 Quick health check (Run this daily)
SELECT 
    (SELECT COUNT(*) FROM taskEscalation WHERE status = 'PENDING') as pending_count,
    (SELECT COUNT(*) FROM taskEscalation WHERE hrEscalatedAt IS NOT NULL) as hr_escalated_count,
    (SELECT COUNT(*) FROM taskEscalation WHERE adminEscalatedAt IS NOT NULL) as admin_escalated_count,
    (SELECT COUNT(*) FROM taskEscalation WHERE resolvedAt IS NOT NULL) as resolved_count,
    (SELECT COUNT(*) FROM notification WHERE type LIKE '%ESCALATION%' AND isRead = false) as unread_notifications,
    (SELECT COUNT(DISTINCT managerId) FROM taskEscalation) as affected_managers;

---

-- 10.2 Test escalation creation (verify daily check is working)
-- This should be run AFTER the daily check job at 12:59 AM
SELECT 
    COUNT(*) as escalations_created_today,
    COUNT(CASE WHEN type = 'NEXT_DAY_MISSING' THEN 1 END) as next_day_missing,
    COUNT(CASE WHEN type = 'FUTURE_4_DAYS_MISSING' THEN 1 END) as future_4_days_missing,
    COUNT(CASE WHEN DATE(createdAt) = CURRENT_DATE THEN 1 END) as created_today
FROM taskEscalation
WHERE DATE(createdAt) = CURRENT_DATE;

---

-- 10.3 Test reminder jobs (verify reminders are being sent)
-- Check this at specific times (1 PM, 2 PM, 2:30 PM)
SELECT 
    COUNT(CASE WHEN reminder1SentAt IS NOT NULL AND DATE(reminder1SentAt) = CURRENT_DATE THEN 1 END) as reminders_1pm_today,
    COUNT(CASE WHEN reminder2SentAt IS NOT NULL AND DATE(reminder2SentAt) = CURRENT_DATE THEN 1 END) as reminders_2pm_today,
    COUNT(CASE WHEN reminder3SentAt IS NOT NULL AND DATE(reminder3SentAt) = CURRENT_DATE THEN 1 END) as reminders_2_30pm_today,
    COUNT(CASE WHEN hrEscalatedAt IS NOT NULL AND DATE(hrEscalatedAt) = CURRENT_DATE THEN 1 END) as hr_escalations_3pm_today,
    COUNT(CASE WHEN adminEscalatedAt IS NOT NULL AND DATE(adminEscalatedAt) = CURRENT_DATE THEN 1 END) as admin_escalations_4pm_today,
    COUNT(CASE WHEN finalEscalatedAt IS NOT NULL AND DATE(finalEscalatedAt) = CURRENT_DATE THEN 1 END) as final_escalations_6pm_today
FROM taskEscalation;

---

-- ======================================================================
-- MAINTENANCE QUERIES
-- ======================================================================

-- 11.1 Archive old resolved escalations (older than 90 days)
-- CAUTION: Only run after backing up database
-- DELETE FROM taskEscalation 
-- WHERE status = 'RESOLVED' AND resolvedAt < NOW() - INTERVAL '90 days';

---

-- 11.2 Reset escalations for specific employee (Testing only)
-- CAUTION: Only run for testing purposes
-- DELETE FROM taskEscalation 
-- WHERE employeeId = 'EMPLOYEE_ID' AND DATE(createdAt) = CURRENT_DATE;

---

-- ======================================================================
-- END OF DATABASE VERIFICATION QUERIES
-- ======================================================================
-- Last Updated: May 15, 2026
-- For questions or issues, contact the development team

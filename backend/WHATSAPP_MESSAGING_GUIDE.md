# WhatsApp Messaging System - Implementation Guide

## Overview

This document provides complete setup and configuration instructions for the WhatsApp client messaging system that was just implemented.

**Features:**
- ✅ Automated daily messaging at 8 PM IST
- ✅ Sends upload status + social media stats to clients
- ✅ Message history with filtering (Admin/HR/Manager dashboard)
- ✅ Manual message trigger for testing
- ✅ Role-based access control
- ✅ Error handling and retry logic

---

## Prerequisites

Before using this system, ensure you have:

1. **Meta WhatsApp Business Account** - Set up at https://www.whatsapp.com/business/
2. **WhatsApp Business API Credentials** - Get from Meta Developer Console
3. **Project Configuration** - Each project needs:
   - Client phone number (in E.164 format, e.g., +91...)
   - Department: "Social Media" or "Marketing"
   - Assigned manager

---

## Environment Setup

### 1. Add WhatsApp API Credentials to `.env`

```bash
# .env file
WHATSAPP_API_KEY=your_meta_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
```

**Where to find these:**
- Go to https://developers.facebook.com/
- Select your app → WhatsApp → Configuration
- Copy the Access Token → `WHATSAPP_API_KEY`
- Copy the Phone Number ID → `WHATSAPP_PHONE_NUMBER_ID`
- Copy the Business Account ID (optional, for future features)

### 2. Test WhatsApp Sandbox (Development)

For testing, use Meta's WhatsApp sandbox:
- Go to your App Settings → WhatsApp → Getting Started
- Add test phone numbers
- Messages sent to these numbers will be delivered immediately

### 3. Verify Database Tables

The migration has already created:
- `WhatsappMessage` - Stores all sent messages
- `WhatsappTemplate` - Template definitions (optional)

Run Prisma Studio to verify:
```bash
npx prisma studio
```

---

## API Endpoints

### Get Message History
```
GET /api/whatsapp-messages
Query Parameters:
  - projectId (optional): Filter by project
  - dateFrom (optional): Start date (ISO 8601)
  - dateTo (optional): End date (ISO 8601)
  - status (optional): PENDING, SENT, DELIVERED, FAILED
  - managerId (optional): Filter by manager (Admin/HR only)
  - limit (default: 50, max: 200)
  - offset (default: 0)

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "projectName": "Project Name",
      "clientName": "Client Name",
      "clientPhone": "+91...",
      "managerName": "Manager Name",
      "messagePreview": "📱 *Automated Update...",
      "status": "SENT",
      "sentAt": "2026-08-18T20:15:00Z",
      "deliveredAt": null,
      "createdAt": "2026-08-18T20:15:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "pages": 3
  }
}
```

### Get Full Message Details
```
GET /api/whatsapp-messages/{messageId}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "projectName": "Project Name",
    "clientName": "Client Name",
    "clientPhone": "+91...",
    "managerName": "Manager Name",
    "managerEmail": "manager@email.com",
    "fullContent": "📱 *Automated Update from We Promote*\nProject: ...",
    "status": "SENT",
    "messageId": "wamid.xyz...",
    "failureReason": null,
    "sentAt": "2026-08-18T20:15:00Z",
    "deliveredAt": null,
    "createdAt": "2026-08-18T20:15:00Z",
    "updatedAt": "2026-08-18T20:15:00Z"
  }
}
```

### Get Message Statistics
```
GET /api/whatsapp-messages/stats/summary
Query Parameters:
  - projectId (optional)
  - dateFrom (optional)
  - dateTo (optional)
  - managerId (optional)

Response:
{
  "success": true,
  "data": {
    "total": 150,
    "sent": 145,
    "delivered": 140,
    "failed": 5,
    "pending": 0,
    "successRate": "93.33"
  }
}
```

### Send Message Manually
```
POST /api/whatsapp-messages/send-manual
Body:
{
  "projectId": "uuid-of-project"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectName": "Project Name",
    "clientName": "Client Name",
    "clientPhone": "+91...",
    "status": "sent",
    "message": "Message sent successfully",
    "messageId": "wamid.xyz...",
    "sentAt": "2026-08-18T20:15:00Z"
  }
}
```

### Trigger Daily Job (Admin/HR Only)
```
POST /api/whatsapp-messages/trigger-job

Response:
{
  "success": true,
  "message": "Daily messaging job triggered successfully",
  "data": {
    "totalProjects": 25,
    "projectsWithManagers": 24,
    "messagesGenerated": 24,
    "messagesSent": 23,
    "messagesFailed": 1,
    "errors": [
      {
        "project": "Project Name",
        "manager": "Manager Name",
        "error": "Invalid phone number format"
      }
    ]
  }
}
```

---

## Access Control

| Role | Can View | Can Send Manual | Can Trigger Job |
|------|----------|-----------------|-----------------|
| Admin | All messages | Any project | ✅ |
| HR | All messages | Any project | ✅ |
| EA | All messages | Any project | ❌ |
| Manager | Own messages only | Assigned projects | ❌ |
| Employee | None | None | ❌ |
| Coordinator | None | None | ❌ |

---

## Scheduled Job Details

### Execution Time
- **When**: Every day at 8:00 PM IST (20:00 IST)
- **Timezone**: Asia/Kolkata
- **UTC Equivalent**: 2:30 PM UTC (14:30)

### What It Does
1. Finds all projects in Social Media/Marketing departments
2. For each project with assigned managers:
   - Fetches today's upload data
   - Fetches today's marketing stats
   - Generates formatted message
   - Sends via WhatsApp
   - Logs to database
3. Handles errors gracefully (continues with other projects)
4. Logs execution summary

### Job Status
```javascript
// Check if job is running
GET /api/whatsapp-messages/status (coming soon)
```

---

## Message Format

Messages include the following sections:

### Header
```
📱 *Automated Update from We Promote*
Project: *Project Name*
Date: Mon, Aug 18, 2026
```

### Upload Status
```
📤 *Today's Upload Status*
────────────────────────────────────
✅ Upload completed today!
📎 Submission Link: https://...
📎 Content Link: https://...
🎥 Video Link: https://...
```

OR (if no upload):
```
❌ No uploads today
```

### Social Media Stats
```
📊 *Today's Social Media Stats*
────────────────────────────────────
🔗 Post/Video: https://...
👥 Total Reach: 15,000
💰 Amount Spent: ₹2,500.00
🎯 Leads Obtained: 45
🚀 Ad Status: Running
```

### Footer
```
────────────────────────────────────
💡 For detailed reports, visit your dashboard
✉️ Have questions? Contact your account manager

Best regards,
*We Promote Team*
```

---

## Error Handling

The system handles various error scenarios:

### Invalid Phone Number
- **Error**: Phone not in E.164 format
- **Action**: Message logged as FAILED, reason stored
- **Resolution**: Update project's phone number in admin panel

### Missing API Credentials
- **Error**: WHATSAPP_API_KEY or WHATSAPP_PHONE_NUMBER_ID not set
- **Action**: Job logs error, continues with other projects
- **Resolution**: Set environment variables and restart server

### Rate Limiting
- **Error**: 429 Too Many Requests
- **Action**: Message logged as FAILED
- **Resolution**: Wait for rate limit reset, retry manually

### Network Errors
- **Error**: Connection timeout or DNS failure
- **Action**: Message logged as FAILED
- **Resolution**: Check internet connectivity, retry

### Missing Client Phone
- **Error**: Project doesn't have phone number configured
- **Action**: Project skipped in daily job
- **Resolution**: Add phone number to project in admin panel

---

## Troubleshooting

### Messages not sending
1. Check `.env` file has valid `WHATSAPP_API_KEY` and `WHATSAPP_PHONE_NUMBER_ID`
2. Verify project has client phone number in E.164 format (+91...)
3. Ensure department is "Social Media" or "Marketing"
4. Check server logs for specific error messages
5. Test with manual send: `POST /api/whatsapp-messages/send-manual`

### Job not running at scheduled time
1. Check server logs for job initialization message
2. Verify server timezone is set correctly
3. Check if there are any database connection errors
4. Manually trigger job for testing: `POST /api/whatsapp-messages/trigger-job`

### Messages not appearing in frontend
1. Verify user role has access (Admin/HR/Manager)
2. Check date range filters
3. Verify ProjectMonthlySheetDay entries exist for the date
4. Check database directly: 
   ```sql
   SELECT * FROM "WhatsappMessage" ORDER BY "createdAt" DESC LIMIT 10;
   ```

### Phone number validation errors
- Accepted formats:
  - `+919876543210` (E.164)
  - `+91 9876543210` (with space)
  - `09876543210` (Indian format - auto-converted)
- Not accepted:
  - `9876543210` (no country code)
  - `+91-98765-43210` (with dashes)

---

## Performance Considerations

### Database Indexes
Created indexes on:
- `projectId` - Fast project lookups
- `managerId` - Fast manager filtering
- `status` - Quick status filtering
- `sentAt` - Date range queries
- `createdAt` - Pagination and sorting

### Pagination
- Default limit: 50 messages
- Maximum limit: 200 messages
- Use offset-based pagination for large result sets

### Message Cleanup
- Runs every Sunday
- Deletes messages older than 90 days (status: DELIVERED/FAILED only)
- Keeps PENDING/SENT messages for recent lookups

---

## Testing Checklist

- [ ] `.env` file updated with WhatsApp credentials
- [ ] Database tables created (Prisma Studio shows WhatsappMessage table)
- [ ] Manual send works: POST to `/send-manual` with valid projectId
- [ ] Daily job initialized: Check server logs for "Daily client messaging job initialized"
- [ ] Message history appears: GET `/api/whatsapp-messages`
- [ ] Role-based access works: Manager sees only own messages
- [ ] Scheduled job runs: Check logs at ~8 PM IST
- [ ] Error handling: Try sending to invalid phone number, verify FAILED status

---

## Frontend Integration

The frontend team should build a "Messages" dashboard section with:

### Components Needed
1. **Message History Table**
   - Columns: Date | Client | Project | Preview | Status | Manager
   - Click row to view full message
   - Status badge: Green (Delivered), Yellow (Sent), Red (Failed), Gray (Pending)

2. **Filters**
   - Date range picker (dateFrom/dateTo)
   - Project dropdown (query all projects)
   - Status filter (PENDING, SENT, DELIVERED, FAILED)
   - Manager filter (Admin/HR only)

3. **Message Detail Modal**
   - Full message content
   - Sent/Delivered timestamps
   - Failure reason (if failed)
   - Re-send button (calls `/send-manual`)

4. **Statistics Card**
   - Total sent today/week/month
   - Success rate
   - Failed count with quick links to failures

5. **Manual Send Dialog**
   - Project dropdown selector
   - Preview generated message
   - Confirm and send button
   - Success/error toast notification

### API Integration Example
```javascript
// Get messages
GET /api/whatsapp-messages?projectId=xyz&dateFrom=2026-08-18&dateTo=2026-08-18

// Get full message
GET /api/whatsapp-messages/{messageId}

// Get stats
GET /api/whatsapp-messages/stats/summary

// Send manually
POST /api/whatsapp-messages/send-manual
Body: { projectId: "xyz" }

// Trigger job (Admin/HR only)
POST /api/whatsapp-messages/trigger-job
```

---

## Future Enhancements

Possible improvements for Phase 2:

1. **Webhook Integration**
   - Receive delivery confirmations from Meta
   - Auto-update message status to DELIVERED
   - Track read receipts

2. **Template Customization**
   - Different templates per department
   - Custom variables for different project types
   - Admin UI to manage templates

3. **Scheduled Flexibility**
   - Allow different send times per project
   - Support multiple sends per day
   - Customizable message content per project

4. **Advanced Analytics**
   - Message delivery trends
   - Failure analysis
   - Client engagement metrics
   - Export reports

5. **Multi-language Support**
   - Send messages in client's preferred language
   - Regional customization

6. **WhatsApp Media Messages**
   - Send images/PDFs of upload links
   - Rich media content instead of text

---

## Support & Debugging

### Check Job Logs
```bash
# View server console for job execution logs
tail -f server.log | grep "messaging"
```

### Database Query
```sql
-- Get all messages sent today
SELECT * FROM "WhatsappMessage"
WHERE DATE("createdAt") = CURRENT_DATE
ORDER BY "createdAt" DESC;

-- Get failed messages with reasons
SELECT "projectId", "clientPhoneNumber", "failureReason", "createdAt"
FROM "WhatsappMessage"
WHERE "status" = 'FAILED'
ORDER BY "createdAt" DESC;

-- Get stats by status
SELECT "status", COUNT(*) as count
FROM "WhatsappMessage"
GROUP BY "status";
```

### Meta WhatsApp API Docs
- Error Codes: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/errors
- Message Status: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#status-object
- Rate Limits: https://developers.facebook.com/docs/whatsapp/cloud-api/rate-limiting

---

## Implementation Summary

✅ **Phase 1: Database** (Completed)
- WhatsappMessage model with relationships
- WhatsappTemplate model
- Database migration applied

✅ **Phase 2: Services** (Completed)
- `whatsappService.js` - Meta API integration
- `messageTemplateService.js` - Message generation
- `messageLoggingService.js` - Database operations

✅ **Phase 3: Scheduled Job** (Completed)
- `dailyClientMessagesJob.js` - Cron job at 8 PM IST
- Integrated into server.js

✅ **Phase 4: API Module** (Completed)
- `whatsapp-message` module with full CRUD
- Routes, controller, validation
- Role-based access control

📋 **Phase 5: Frontend** (To Be Done)
- Message history dashboard
- Filters and search
- Message detail view
- Statistics and analytics
- Manual send functionality

---

**Status**: 🟢 **Ready for Testing and Frontend Development**

For questions or issues, check the troubleshooting section above.

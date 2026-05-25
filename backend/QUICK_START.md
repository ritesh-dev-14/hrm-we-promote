# 🚀 QUICK START - Task Escalation Feature

## ⚡ 5-Minute Setup

### 1️⃣ Update `.env` file
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=noreply@wepromotehR.com
APP_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

### 2️⃣ Run Database Migration
```bash
cd backend
npx prisma migrate dev --name add_escalation_type_field
npx prisma generate
```

### 3️⃣ Start Backend
```bash
npm run dev
```

**Expected Output:**
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
🚀 Server running on port 8000
📡 WebSocket server ready at ws://localhost:8000
```

### 4️⃣ Add to Frontend `App.jsx`
```jsx
import useEscalationNotifications from "./hooks/useEscalationNotifications";
import EscalationAlert from "./components/EscalationAlert";

function App() {
  const user = useContext(AuthContext);
  const { currentNotification, clearNotification } = useEscalationNotifications(
    user?.id,
    !!user
  );

  return (
    <>
      {/* Your app content */}
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

### 5️⃣ Add to Task Creation Endpoints

Wherever you create `TaskAssignment` records:

```javascript
import { autoResolveEscalation } from "../utils/escalationHelper";

// After creating task assignment:
await autoResolveEscalation(managerId, employeeId, taskDate);
```

### ✅ Done!

The system is now running with:
- ✅ Automatic daily detection at 12:59 AM
- ✅ Manager reminders at 1 PM, 2 PM, 2:30 PM
- ✅ HR escalation at 3 PM
- ✅ Admin escalation at 4 PM
- ✅ Final escalation at 6 PM
- ✅ Real-time pop-up notifications
- ✅ Email notifications
- ✅ In-app notifications

---

## 🧪 Test It

### Manual Check
```bash
curl -X POST http://localhost:8000/api/escalations/check/manual \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### View Escalations
```bash
curl http://localhost:8000/api/escalations/pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View Stats
```bash
curl http://localhost:8000/api/escalations/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📖 More Details

- **Full Guide:** See `ESCALATION_FEATURE_GUIDE.md`
- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`
- **Code Examples:** See `INTEGRATION_EXAMPLE.js`

---

## 🔧 Customize Timing

Edit `src/jobs/escalationJobs.js` to change reminder times.

Current schedule:
- `"59 0 * * *"` = 12:59 AM
- `"0 13 * * *"` = 1:00 PM
- `"0 14 * * *"` = 2:00 PM
- `"30 14 * * *"` = 2:30 PM
- `"0 15 * * *"` = 3:00 PM
- `"0 16 * * *"` = 4:00 PM
- `"0 18 * * *"` = 6:00 PM

Format: `"minute hour day month dayOfWeek"`

---

## ❓ Issues?

1. **Jobs not running?** Check server logs for "SETTING UP ESCALATION JOBS"
2. **No emails?** Verify MAIL_* variables in `.env`
3. **No pop-ups?** Check browser console for Socket.io connection
4. **Escalations not resolving?** Call `autoResolveEscalation()` when task is assigned

See `ESCALATION_FEATURE_GUIDE.md` for troubleshooting.

---

## 🎉 You're All Set!

The feature is now live and monitoring manager task assignments 24/7!

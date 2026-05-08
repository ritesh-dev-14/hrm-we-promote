# HR Leave Management - API Test Guide (Postman)

## Server Details
- **Base URL**: `http://localhost:8000`
- **API Prefix**: `/api/hr`
- **Server Running**: ✅ Port 8000

---

## 1. AUTHENTICATION - Login as HR User

### Endpoint: POST /api/auth/login
**Description**: Get JWT token to access HR-protected routes

```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "hr@company.com",
  "password": "hr_password_123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "hr-user-id-uuid",
      "employeeId": "HR-001",
      "name": "HR Manager",
      "email": "hr@company.com",
      "role": "HR",
      "department": "Human Resources",
      "createdAt": "2026-05-08T07:30:00.000Z"
    }
  }
}
```

**⚠️ Save the token for all following requests**

---

## 2. GET ALL LEAVE REQUESTS

### Endpoint: GET /api/hr/leaves
**Description**: Retrieve all leave requests (HR only)
**Authentication**: Required (Bearer Token)
**Authorization**: Only HR role can access

```http
GET http://localhost:8000/api/hr/leaves
Authorization: Bearer <YOUR_HR_TOKEN>
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "leave-id-1",
      "userId": "employee-user-id",
      "startDate": "2026-05-15T00:00:00.000Z",
      "endDate": "2026-05-17T00:00:00.000Z",
      "type": "CASUAL",
      "days": 3,
      "reason": "Personal work",
      "status": "PENDING",
      "reviewedBy": null,
      "reviewNote": null,
      "createdAt": "2026-05-08T06:00:00.000Z",
      "user": {
        "name": "John Employee",
        "employeeId": "EMP-101",
        "department": "Engineering"
      }
    },
    {
      "id": "leave-id-2",
      "userId": "employee-user-id-2",
      "startDate": "2026-05-20T00:00:00.000Z",
      "endDate": "2026-05-22T00:00:00.000Z",
      "type": "SICK",
      "days": 2,
      "reason": "Medical checkup",
      "status": "PENDING",
      "reviewedBy": null,
      "reviewNote": null,
      "createdAt": "2026-05-07T10:30:00.000Z",
      "user": {
        "name": "Jane Employee",
        "employeeId": "EMP-102",
        "department": "Sales"
      }
    }
  ]
}
```

---

## 3. GET EMPLOYEE LEAVE SUMMARY

### Endpoint: GET /api/hr/leave/employee/:employeeId
**Description**: Get leave balance and summary for a specific employee
**Authentication**: Required (Bearer Token)
**Authorization**: Only HR role can access
**Path Parameter**: `employeeId` - Employee ID (e.g., "EMP-101")

```http
GET http://localhost:8000/api/hr/leave/employee/EMP-101
Authorization: Bearer <YOUR_HR_TOKEN>
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "totalLeaves": 5,
    "approved": 2,
    "pending": 2,
    "rejected": 1,
    "balance": {
      "casualLeft": 11,
      "sickLeft": 4
    }
  }
}
```

**Error Response (404) - Employee not found:**
```json
{
  "success": false,
  "message": "Employee not found",
  "statusCode": 404
}
```

---

## 4. APPROVE LEAVE

### Endpoint: PUT /api/hr/leave/:id
**Description**: Approve a pending leave request
**Authentication**: Required (Bearer Token)
**Authorization**: Only HR role can access
**Path Parameter**: `id` - Leave request ID

```http
PUT http://localhost:8000/api/hr/leave/leave-id-1
Authorization: Bearer <YOUR_HR_TOKEN>
Content-Type: application/json

{
  "status": "APPROVED",
  "reviewNote": "Approved for the requested dates"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Leave updated successfully",
  "data": {
    "id": "leave-id-1",
    "userId": "employee-user-id",
    "startDate": "2026-05-15T00:00:00.000Z",
    "endDate": "2026-05-17T00:00:00.000Z",
    "type": "CASUAL",
    "days": 3,
    "reason": "Personal work",
    "status": "APPROVED",
    "reviewedBy": "hr-user-id-uuid",
    "reviewNote": "Approved for the requested dates",
    "createdAt": "2026-05-08T06:00:00.000Z",
    "user": {
      "name": "John Employee",
      "employeeId": "EMP-101"
    }
  }
}
```

---

## 5. REJECT LEAVE

### Endpoint: PUT /api/hr/leave/:id
**Description**: Reject a pending leave request (rejection reason is REQUIRED)
**Authentication**: Required (Bearer Token)
**Authorization**: Only HR role can access
**Path Parameter**: `id` - Leave request ID

```http
PUT http://localhost:8000/api/hr/leave/leave-id-2
Authorization: Bearer <YOUR_HR_TOKEN>
Content-Type: application/json

{
  "status": "REJECTED",
  "reviewNote": "Cannot approve - critical project deadline"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Leave updated successfully",
  "data": {
    "id": "leave-id-2",
    "userId": "employee-user-id-2",
    "startDate": "2026-05-20T00:00:00.000Z",
    "endDate": "2026-05-22T00:00:00.000Z",
    "type": "SICK",
    "days": 2,
    "reason": "Medical checkup",
    "status": "REJECTED",
    "reviewedBy": "hr-user-id-uuid",
    "reviewNote": "Cannot approve - critical project deadline",
    "createdAt": "2026-05-07T10:30:00.000Z",
    "user": {
      "name": "Jane Employee",
      "employeeId": "EMP-102"
    }
  }
}
```

**Error Response (400) - Missing rejection reason:**
```json
{
  "success": false,
  "message": "Rejection reason is required",
  "statusCode": 400
}
```

---

## 6. SECURITY TESTS

### Test 6.1: Non-HR User Cannot Access Leave APIs

#### Login as Employee
```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "employee@company.com",
  "password": "emp_password_123"
}
```

#### Try to Get All Leaves (should fail)
```http
GET http://localhost:8000/api/hr/leaves
Authorization: Bearer <EMPLOYEE_TOKEN>
Content-Type: application/json
```

**Expected Response (403 - Forbidden):**
```json
{
  "success": false,
  "message": "Forbidden: Insufficient permissions",
  "statusCode": 403
}
```

---

### Test 6.2: Missing/Invalid Token

```http
GET http://localhost:8000/api/hr/leaves
Authorization: Bearer invalid_token_xyz123
Content-Type: application/json
```

**Expected Response (401 - Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized: Invalid token",
  "statusCode": 401
}
```

---

### Test 6.3: No Authorization Header

```http
GET http://localhost:8000/api/hr/leaves
Content-Type: application/json
```

**Expected Response (401 - Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized: No token provided",
  "statusCode": 401
}
```

---

## 7. ERROR SCENARIOS

### Test 7.1: Leave Already Processed (Cannot Update Again)

**After approving a leave, try to approve it again:**
```http
PUT http://localhost:8000/api/hr/leave/leave-id-1
Authorization: Bearer <YOUR_HR_TOKEN>
Content-Type: application/json

{
  "status": "REJECTED",
  "reviewNote": "Changing to rejected"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Leave already processed",
  "statusCode": 400
}
```

---

### Test 7.2: Invalid Status Value

```http
PUT http://localhost:8000/api/hr/leave/leave-id-3
Authorization: Bearer <YOUR_HR_TOKEN>
Content-Type: application/json

{
  "status": "CANCELLED",
  "reviewNote": "Invalid status"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid status",
  "statusCode": 400
}
```

---

### Test 7.3: Leave Not Found

```http
PUT http://localhost:8000/api/hr/leave/invalid-leave-id-999
Authorization: Bearer <YOUR_HR_TOKEN>
Content-Type: application/json

{
  "status": "APPROVED",
  "reviewNote": "This leave doesn't exist"
}
```

**Expected Response (404):**
```json
{
  "success": false,
  "message": "Leave not found",
  "statusCode": 404
}
```

---

## 8. POSTMAN COLLECTION SETUP

### Step 1: Create Environment Variables in Postman

Create a new environment with these variables:

```
Variable Name          | Initial Value | Current Value
----------------------|---------------|------------------
base_url              | localhost     | http://localhost:8000
hr_token              | (empty)       | (set after login)
employee_token        | (empty)       | (set after login)
leave_id              | (empty)       | (set from response)
employee_id           | EMP-101       | EMP-101
```

### Step 2: Set Token After Login

In Postman, go to login request → Tests tab, add:

```javascript
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("hr_token", jsonData.data.token);
}
```

### Step 3: Use Variables in Requests

Replace hardcoded values with:
- `{{base_url}}` instead of `http://localhost:8000`
- `Bearer {{hr_token}}` in Authorization header
- `{{leave_id}}` in path parameters
- `{{employee_id}}` in path parameters

---

## 9. API SUMMARY TABLE

| # | Method | Endpoint | Auth | Role | Purpose |
|---|--------|----------|------|------|---------|
| 1 | POST | /api/auth/login | ❌ | All | Get JWT token |
| 2 | GET | /api/hr/leaves | ✅ | HR | Get all leave requests |
| 3 | GET | /api/hr/leave/employee/:employeeId | ✅ | HR | Get employee leave summary |
| 4 | PUT | /api/hr/leave/:id | ✅ | HR | Approve/Reject leave |

---

## 10. KEY SECURITY FEATURES ✅

✅ All leave endpoints require JWT authentication
✅ All leave endpoints require HR role authorization
✅ Rejection of leaves requires a reason (reviewNote)
✅ Cannot update already processed leaves
✅ Non-HR users get 403 Forbidden error
✅ Invalid/missing tokens get 401 Unauthorized error
✅ HR role verification added in updateLeaveStatus service
✅ Only HR users can modify leave status

---

## 11. DATABASE RELATIONSHIPS

```
User (HR) --reviews--> Leave <--belongs to-- User (Employee)
                          |
                          v
                    LeaveBalance (tracks casual & sick leave usage)
                    Attendance (updated when leave is approved)
```

---

## Testing Checklist

- [ ] Login as HR and get token
- [ ] Get all leaves - verify returns pending leaves
- [ ] Get employee leave summary - verify balance shown
- [ ] Approve a leave - verify status changes to APPROVED
- [ ] Reject a leave with reason - verify rejection note saved
- [ ] Try to update already processed leave - verify error
- [ ] Login as Employee and try /api/hr/leaves - verify 403 error
- [ ] Try API without token - verify 401 error
- [ ] Try API with invalid token - verify 401 error
- [ ] Verify attendance records created when leave approved

---

**Last Updated**: May 8, 2026
**Status**: All APIs tested and secured ✅

# Complete API Testing Guide - All Modules

## ✅ Server Status
- **Base URL**: `http://localhost:8000`
- **Server Port**: 8000
- **Status**: Running ✅

---

## ⚠️ IMPORTANT POSTMAN SETUP

### Issue: Getting 404 in Postman?
**Solution**: Make sure your URLs include the `/api/` prefix!

### Postman Setup Steps:
1. **Create Environment Variable**:
   - Variable Name: `base_url`
   - Value: `http://localhost:8000`

2. **Use in all requests**: `{{base_url}}/api/...`

3. **Test root endpoint first**:
   ```
   GET http://localhost:8000/
   Expected Response: "API Running..."
   ```

---

## 🔐 1. AUTH MODULE - `/api/auth`

### 1.1 Login (NO AUTH REQUIRED)
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "employeeId": "ADMIN-001",
      "name": "Admin User",
      "email": "admin@test.com",
      "role": "ADMIN",
      "department": "Administration",
      "createdAt": "2026-05-08T00:00:00.000Z"
    }
  }
}
```

**Save the token**: Copy and paste into Postman environment variable `auth_token`

---

## 📊 2. ATTENDANCE MODULE - `/api/attendance`

### 2.1 Start Work (Requires Auth)
```http
POST {{base_url}}/api/attendance/start
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "attendance-id",
    "userId": "user-id",
    "date": "2026-05-08T00:00:00.000Z",
    "startTime": "2026-05-08T09:00:00.000Z",
    "status": "PRESENT",
    "createdAt": "2026-05-08T09:00:00.000Z"
  }
}
```

---

### 2.2 Start Break (Requires Auth)
```http
POST {{base_url}}/api/attendance/break/start
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{}
```

---

### 2.3 End Break (Requires Auth)
```http
POST {{base_url}}/api/attendance/break/end
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{}
```

---

### 2.4 Stop Work (Requires Auth)
```http
POST {{base_url}}/api/attendance/stop
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{}
```

---

### 2.5 Get Today's Attendance (Requires Auth)
```http
GET {{base_url}}/api/attendance/today
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

---

### 2.6 Get Attendance History (Requires Auth)
```http
GET {{base_url}}/api/attendance/history
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

---

### 2.7 Get Attendance Summary (Requires Auth)
```http
GET {{base_url}}/api/attendance/summary
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

---

### 2.8 Get All Attendance (Requires Auth + HR Role)
```http
GET {{base_url}}/api/attendance/
Authorization: Bearer {{hr_token}}
Content-Type: application/json
```

---

### 2.9 Get Employee Attendance (Requires Auth + HR Role)
```http
GET {{base_url}}/api/attendance/EMP-101
Authorization: Bearer {{hr_token}}
Content-Type: application/json
```

---

### 2.10 Get Attendance Dashboard (Requires Auth + HR Role)
```http
GET {{base_url}}/api/attendance/dashboard
Authorization: Bearer {{hr_token}}
Content-Type: application/json
```

---

## 👥 3. HR MODULE - `/api/hr`

### ⚠️ ALL HR ENDPOINTS REQUIRE: Auth + HR Role

First, login as HR user to get `hr_token`:
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "hr@test.com",
  "password": "hr123"
}
```

---

### 3.1 Create Manager (HR Only)
```http
POST {{base_url}}/api/hr/manager
Authorization: Bearer {{hr_token}}
Content-Type: application/json

{
  "employeeId": "MGR-001",
  "name": "John Manager",
  "email": "manager@test.com",
  "password": "mgr123456",
  "department": "Engineering"
}
```

---

### 3.2 Get All Managers (HR Only)
```http
GET {{base_url}}/api/hr/managers
Authorization: Bearer {{hr_token}}
Content-Type: application/json
```

---

### 3.3 Get Specific Manager (HR Only)
```http
GET {{base_url}}/api/hr/manager/MGR-001
Authorization: Bearer {{hr_token}}
Content-Type: application/json
```

---

### 3.4 Update Manager (HR Only)
```http
PUT {{base_url}}/api/hr/manager/MGR-001
Authorization: Bearer {{hr_token}}
Content-Type: application/json

{
  "name": "John Manager Updated",
  "department": "Engineering & Operations"
}
```

---

### 3.5 Delete Manager (HR Only)
```http
DELETE {{base_url}}/api/hr/manager/MGR-001
Authorization: Bearer {{hr_token}}
Content-Type: application/json
```

---

### 3.6 Create Employee (HR Only)
```http
POST {{base_url}}/api/hr/employee
Authorization: Bearer {{hr_token}}
Content-Type: application/json

{
  "employeeId": "EMP-101",
  "name": "Jane Employee",
  "email": "jane@test.com",
  "password": "emp123456",
  "role": "EMPLOYEE",
  "department": "Engineering",
  "position": "Software Engineer",
  "managerId": "MGR-001"
}
```

---

### 3.7 Get All Employees (HR Only)
```http
GET {{base_url}}/api/hr/employees
Authorization: Bearer {{hr_token}}
Content-Type: application/json
```

---

### 3.8 Get Specific Employee (HR Only)
```http
GET {{base_url}}/api/hr/employee/EMP-101
Authorization: Bearer {{hr_token}}
Content-Type: application/json
```

---

### 3.9 Update Employee (HR Only)
```http
PUT {{base_url}}/api/hr/employee/EMP-101
Authorization: Bearer {{hr_token}}
Content-Type: application/json

{
  "name": "Jane Employee Updated",
  "email": "jane.new@test.com"
}
```

---

### 3.10 Delete Employee (HR Only)
```http
DELETE {{base_url}}/api/hr/employee/EMP-101
Authorization: Bearer {{hr_token}}
Content-Type: application/json
```

---

### 3.11 Get Employee Attendance (HR Only)
```http
GET {{base_url}}/api/hr/employee/EMP-101/attendance
Authorization: Bearer {{hr_token}}
Content-Type: application/json
```

---

### 3.12 Get Employee Attendance Summary (HR Only)
```http
GET {{base_url}}/api/hr/employee/EMP-101/attendance/summary
Authorization: Bearer {{hr_token}}
Content-Type: application/json
```

---

### 3.13 Get All Leave Requests (HR Only)
```http
GET {{base_url}}/api/hr/leaves
Authorization: Bearer {{hr_token}}
Content-Type: application/json
```

---

### 3.14 Get Employee Leave Summary (HR Only)
```http
GET {{base_url}}/api/hr/leave/employee/EMP-101
Authorization: Bearer {{hr_token}}
Content-Type: application/json
```

---

### 3.15 Approve Leave (HR Only)
```http
PUT {{base_url}}/api/hr/leave/leave-uuid-id
Authorization: Bearer {{hr_token}}
Content-Type: application/json

{
  "status": "APPROVED",
  "reviewNote": "Approved - enjoy your leave"
}
```

---

### 3.16 Reject Leave (HR Only)
```http
PUT {{base_url}}/api/hr/leave/leave-uuid-id
Authorization: Bearer {{hr_token}}
Content-Type: application/json

{
  "status": "REJECTED",
  "reviewNote": "Cannot approve - critical project deadline"
}
```

---

## 👨‍💼 4. MANAGER MODULE - `/api/manager/tasks`

### ⚠️ ALL MANAGER ENDPOINTS REQUIRE: Auth + Manager Role

Login as Manager:
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "manager@test.com",
  "password": "mgr123456"
}
```

---

### 4.1 Create Task (Manager Only)
```http
POST {{base_url}}/api/manager/tasks/
Authorization: Bearer {{manager_token}}
Content-Type: application/json

{
  "title": "Website Redesign",
  "description": "Complete redesign of company website",
  "date": "2026-05-15T00:00:00.000Z",
  "location": "Office",
  "setupType": "PREMIUM"
}
```

---

### 4.2 Assign Task (Manager Only)
```http
POST {{base_url}}/api/manager/tasks/task-uuid-id/assign
Authorization: Bearer {{manager_token}}
Content-Type: application/json

{
  "userId": "employee-user-id-uuid"
}
```

---

### 4.3 Get All Tasks (Manager Only)
```http
GET {{base_url}}/api/manager/tasks/
Authorization: Bearer {{manager_token}}
Content-Type: application/json
```

---

## 👨‍💻 5. EMPLOYEE MODULE - `/api/employee`

### ⚠️ ALL EMPLOYEE ENDPOINTS REQUIRE: Auth

Login as Employee:
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "jane@test.com",
  "password": "emp123456"
}
```

---

### 5.1 Get Assigned Tasks
```http
GET {{base_url}}/api/employee/tasks
Authorization: Bearer {{employee_token}}
Content-Type: application/json
```

---

### 5.2 Submit Task
```http
POST {{base_url}}/api/employee/task/task-uuid-id/submit
Authorization: Bearer {{employee_token}}
Content-Type: application/json

{
  "submissionNote": "Task completed",
  "driveLink": "https://drive.google.com/..."
}
```

---

### 5.3 Apply Leave
```http
POST {{base_url}}/api/employee/leave
Authorization: Bearer {{employee_token}}
Content-Type: application/json

{
  "startDate": "2026-05-15T00:00:00.000Z",
  "endDate": "2026-05-17T00:00:00.000Z",
  "type": "CASUAL",
  "reason": "Personal work"
}
```

---

### 5.4 Get My Leaves
```http
GET {{base_url}}/api/employee/leaves
Authorization: Bearer {{employee_token}}
Content-Type: application/json
```

---

## 🔍 6. COMMON ISSUES & SOLUTIONS

### Issue: 404 Not Found
**Solutions**:
1. ✅ Check URL includes `/api/` prefix
2. ✅ Verify HTTP method (GET/POST/PUT/DELETE)
3. ✅ Check spelling of endpoint
4. ✅ Verify base URL is `http://localhost:8000`

### Issue: 401 Unauthorized
**Solutions**:
1. ✅ Make sure you have Authorization header
2. ✅ Include `Bearer` prefix before token
3. ✅ Login first to get a valid token
4. ✅ Verify token is not expired

### Issue: 403 Forbidden
**Solutions**:
1. ✅ You don't have the required role
2. ✅ HR endpoints need HR role
3. ✅ Manager endpoints need MANAGER role
4. ✅ Login with appropriate user account

---

## 📋 7. TEST SEQUENCE (Recommended Order)

1. **Root Test**
   - GET http://localhost:8000/

2. **Login Tests**
   - POST /api/auth/login (as Admin)
   - POST /api/auth/login (as HR)
   - POST /api/auth/login (as Manager)
   - POST /api/auth/login (as Employee)

3. **HR Tests** (Use HR token)
   - POST /api/hr/manager (Create Manager)
   - POST /api/hr/employee (Create Employee)
   - GET /api/hr/employees
   - PUT /api/hr/employee/:employeeId (Update)

4. **Attendance Tests** (Use Employee token)
   - POST /api/attendance/start
   - POST /api/attendance/break/start
   - POST /api/attendance/break/end
   - POST /api/attendance/stop

5. **Leave Tests** (Use Employee + HR tokens)
   - POST /api/employee/leave (As Employee)
   - GET /api/hr/leaves (As HR)
   - PUT /api/hr/leave/:id (As HR)

6. **Manager/Task Tests** (Use Manager token)
   - POST /api/manager/tasks/
   - POST /api/manager/tasks/:id/assign

---

## ⚡ QUICK REFERENCE - All Endpoints

| Module | Endpoint | Method | Auth | Role |
|--------|----------|--------|------|------|
| Auth | /api/auth/login | POST | ❌ | Any |
| Attendance | /api/attendance/start | POST | ✅ | Any |
| Attendance | /api/attendance/today | GET | ✅ | Any |
| Attendance | /api/attendance/ | GET | ✅ | HR |
| HR | /api/hr/managers | GET | ✅ | HR |
| HR | /api/hr/manager | POST | ✅ | HR |
| HR | /api/hr/employees | GET | ✅ | HR |
| HR | /api/hr/employee | POST | ✅ | HR |
| HR | /api/hr/leaves | GET | ✅ | HR |
| HR | /api/hr/leave/:id | PUT | ✅ | HR |
| Manager | /api/manager/tasks/ | GET | ✅ | Manager |
| Manager | /api/manager/tasks/ | POST | ✅ | Manager |
| Employee | /api/employee/tasks | GET | ✅ | Employee |
| Employee | /api/employee/leave | POST | ✅ | Employee |

---

**Last Updated**: May 8, 2026
**Status**: All APIs Tested & Working ✅

**Note**: Replace `{{base_url}}`, `{{auth_token}}`, etc. with actual values or Postman environment variables.

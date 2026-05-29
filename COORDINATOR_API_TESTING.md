# 🎯 Coordinator Assignment API - Quick Testing Guide

## Base URL
```
http://localhost:8000
```

---

## 🎯 Quick User IDs for Copy-Paste

```
Coordinator ID: 86a25319-9d46-410b-904e-f616e60aaad7
Employee 1 ID: fe0a33a4-5440-4154-b7c8-b6e9b22a2e4b
Employee 2 ID: 9b9b62f2-5222-4313-ad5f-c05c91ef7137
Employee 3 ID: d53008c9-9c17-4a7e-b166-fdffac9da8c0
Manager ID: 5f563799-6d77-40cf-b018-ab2fae317e3e
HR ID: ed43f911-5d71-4707-a2b9-a4d86c0444c9
Admin ID: cd4d36a8-fab5-40ae-aa2c-073f35f431fb
```

---

## 📌 Step 1: Login as Coordinator

**POST** `http://localhost:8000/api/auth/login`

**Body:**
```json
{
  "email": "coordinator@test.com",
  "password": "123456"
}
```

**Copy the token from response and add to all API calls:**
```
Authorization: Bearer <token>
```

---

## 📌 Step 2: Create & Assign Task (Inline - All in One Call)

**POST** `http://localhost:8000/api/coordinator-assignments`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "task": "Urgent Task - Report Submission",
  "assignedToId": "fe0a33a4-5440-4154-b7c8-b6e9b22a2e4b",
  "assignedBy": "harsh",
  "completionDate": "2026-06-05T18:00:00Z",
  "employeeNumber": "EMP-001",
  "employeeEmail": "employee1@test.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "assignment-id",
    "taskId": "task-id",
    "task": {
      "projectName": "Urgent Task - Report Submission"
    },
    "assignedTo": {
      "name": "Employee 1",
      "email": "employee1@test.com"
    },
    "assignedBy": "harsh",
    "status": "ASSIGNED",
    "completionDate": "2026-06-05T18:00:00Z"
  },
  "message": "Assignment created successfully"
}
```

**Save the `assignment.id` for next steps**

---

## 📌 Step 3: Get My Assignments (Coordinator View)

**GET** `http://localhost:8000/api/coordinator-assignments/my-assignments`

**Headers:**
```
Authorization: Bearer <coordinator_token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "assignment-id",
        "taskId": "task-id",
        "task": {
          "projectName": "Urgent Task - Report Submission"
        },
        "assignedTo": {
          "name": "Employee 1"
        },
        "status": "ASSIGNED"
      }
    ],
    "pagination": {
      "total": 1
    }
  }
}
```

---

## 📌 Step 4: Get Assignments Assigned to a User

**GET** `http://localhost:8000/api/coordinator-assignments/assigned-to/fe0a33a4-5440-4154-b7c8-b6e9b22a2e4b`

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "assignment-id",
        "task": {
          "projectName": "Urgent Task - Report Submission"
        },
        "assignedBy": "harsh",
        "completionDate": "2026-06-05T18:00:00Z",
        "status": "ASSIGNED"
      }
    ]
  }
}
```

---

## 📌 Step 5: Get Single Assignment Details

**GET** `http://localhost:8000/api/coordinator-assignments/assignment-id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "assignment-id",
    "task": {
      "projectName": "Urgent Task - Report Submission"
    },
    "assignedTo": {
      "name": "Employee 1",
      "email": "employee1@test.com",
      "role": "EMPLOYEE"
    },
    "assignedBy": "harsh",
    "completionDate": "2026-06-05T18:00:00Z",
    "status": "ASSIGNED"
  }
}
```

---

## 📌 Step 6: Update Status - IN_PROGRESS

**PATCH** `http://localhost:8000/api/coordinator-assignments/assignment-id/status`

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "assignment-id",
    "status": "IN_PROGRESS",
    "message": "Assignment status updated to IN_PROGRESS"
  },
  "message": "Assignment status updated successfully"
}
```

---

## 📌 Step 7: Update Status - COMPLETED

**PATCH** `http://localhost:8000/api/coordinator-assignments/assignment-id/status`

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "COMPLETED"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "assignment-id",
    "status": "COMPLETED",
    "completedAt": "2026-05-29T10:30:00Z"
  },
  "message": "Assignment status updated successfully"
}
```

---

## 📌 Step 8: Update Status - UNABLE_TO_SUBMIT (With Reason)

**PATCH** `http://localhost:8000/api/coordinator-assignments/assignment-id/status`

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "UNABLE_TO_SUBMIT",
  "reason": "Missing required resources"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "assignment-id",
    "status": "UNABLE_TO_SUBMIT",
    "reason": "Missing required resources"
  },
  "message": "Assignment status updated successfully"
}
```

---

## 📌 Step 9: Update Status - REJECTED (With Reason)

**PATCH** `http://localhost:8000/api/coordinator-assignments/assignment-id/status`

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "REJECTED",
  "reason": "Requirements are unclear"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "assignment-id",
    "status": "REJECTED",
    "reason": "Requirements are unclear"
  },
  "message": "Assignment status updated successfully"
}
```

---

## 📌 Step 10: Update Status - SUBMITTED

**PATCH** `http://localhost:8000/api/coordinator-assignments/assignment-id/status`

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "SUBMITTED"
}
```

---

## 📌 Step 11: List All Assignments (Admin/Coordinator Only)

**GET** `http://localhost:8000/api/coordinator-assignments`

**Headers:**
```
Authorization: Bearer <coordinator_or_admin_token>
Content-Type: application/json
```

**Query Params (Optional):**
```
?status=ASSIGNED&skip=0&take=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "assignment-id",
        "task": {
          "projectName": "Urgent Task - Report Submission"
        },
        "assignedTo": {
          "name": "Employee 1"
        },
        "createdBy": {
          "name": "Coordinator User"
        },
        "assignedBy": "harsh",
        "status": "ASSIGNED"
      }
    ],
    "pagination": {
      "total": 1
    }
  }
}
```

---

## 🎯 Test User Credentials

| Role | Email | Password | ID |
|------|-------|----------|-----|
| Coordinator | coordinator@test.com | 123456 | COORD-001 |
| Employee 1 | employee1@test.com | 123456 | EMP-001 |
| Employee 2 | employee2@test.com | 123456 | EMP-002 |
| Employee 3 | employee3@test.com | 123456 | EMP-003 |
| Manager | manager@test.com | 123456 | MGR-001 |
| HR | hrwepromote@gmail.com | 123456 | HR-001 |
| Admin | admin@test.com | 123456 | ADMIN-001 |

---

## ✅ Assignment Status Values

| Status | Requires Reason? | Description |
|--------|------------------|-------------|
| IN_PROGRESS | No | User starts working on task |
| SUBMITTED | No | User submits work for review |
| COMPLETED | No | Task completed successfully |
| UNABLE_TO_SUBMIT | Yes | Cannot complete the task |
| REJECTED | Yes | Reject the assignment |

---

## ❌ Error Examples

**Missing Authorization:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Only Coordinator Can Create:**
```json
{
  "success": false,
  "message": "Access denied"
}
```

**Reason Required:**
```json
{
  "success": false,
  "message": "Reason is required for status: UNABLE_TO_SUBMIT"
}
```

---

---

## 👥 APIs for EMPLOYEES / HR / MANAGER to View Their Assigned Tasks

### **API 1: Get All Tasks Assigned to Me**

**GET** `http://localhost:8000/api/coordinator-assignments/assigned-to/{MY_USER_ID}`

**Headers:**
```
Authorization: Bearer <my_token>
Content-Type: application/json
```

**Example:** Get tasks assigned to Employee 1
```
GET http://localhost:8000/api/coordinator-assignments/assigned-to/fe0a33a4-5440-4154-b7c8-b6e9b22a2e4b
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "assignment-id-1",
        "taskId": "task-id-1",
        "task": {
          "id": "task-id-1",
          "projectName": "Urgent Task - Report Submission",
          "description": "Urgent Task - Report Submission",
          "status": "DRAFT"
        },
        "assignedBy": "harsh",
        "completionDate": "2026-06-05T18:00:00Z",
        "status": "ASSIGNED",
        "reason": null
      },
      {
        "id": "assignment-id-2",
        "taskId": "task-id-2",
        "task": {
          "id": "task-id-2",
          "projectName": "Another Urgent Task",
          "description": "Another Urgent Task"
        },
        "assignedBy": "nishay",
        "completionDate": "2026-06-10T18:00:00Z",
        "status": "IN_PROGRESS"
      }
    ],
    "pagination": {
      "total": 2,
      "skip": 0,
      "take": 10
    }
  }
}
```

**Query Parameters (Optional):**
```
?status=ASSIGNED&skip=0&take=10

status options: ASSIGNED, IN_PROGRESS, SUBMITTED, COMPLETED, UNABLE_TO_SUBMIT, REJECTED
```

---

### **API 2: Get Single Task Details**

**GET** `http://localhost:8000/api/coordinator-assignments/{ASSIGNMENT_ID}`

**Headers:**
```
Authorization: Bearer <my_token>
Content-Type: application/json
```

**Example:**
```
GET http://localhost:8000/api/coordinator-assignments/assignment-id-1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "assignment-id-1",
    "taskId": "task-id-1",
    "task": {
      "id": "task-id-1",
      "projectName": "Urgent Task - Report Submission",
      "description": "Urgent Task - Report Submission",
      "startDate": "2026-05-29T05:00:00Z",
      "endDate": "2026-06-05T18:00:00Z",
      "status": "DRAFT"
    },
    "assignedTo": {
      "id": "fe0a33a4-5440-4154-b7c8-b6e9b22a2e4b",
      "name": "Employee 1",
      "email": "employee1@test.com",
      "employeeId": "EMP-001",
      "role": "EMPLOYEE"
    },
    "assignedBy": "harsh",
    "completionDate": "2026-06-05T18:00:00Z",
    "employeeNumber": "EMP-001",
    "employeeEmail": "employee1@test.com",
    "status": "ASSIGNED",
    "reason": null,
    "createdBy": {
      "id": "86a25319-9d46-410b-904e-f616e60aaad7",
      "name": "Coordinator User"
    }
  }
}
```

---

### **API 3: Update Task Status (Employee Updates)**

**PATCH** `http://localhost:8000/api/coordinator-assignments/{ASSIGNMENT_ID}/status`

**Headers:**
```
Authorization: Bearer <my_token>
Content-Type: application/json
```

**Body - Start Working:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Body - Submit Work:**
```json
{
  "status": "SUBMITTED"
}
```

**Body - Mark Complete:**
```json
{
  "status": "COMPLETED"
}
```

**Body - Cannot Do (With Reason):**
```json
{
  "status": "UNABLE_TO_SUBMIT",
  "reason": "Missing required documents"
}
```

**Body - Reject (With Reason):**
```json
{
  "status": "REJECTED",
  "reason": "Requirements are unclear"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "assignment-id-1",
    "status": "IN_PROGRESS",
    "startedAt": "2026-05-29T10:30:00Z"
  },
  "message": "Assignment status updated successfully"
}
```

---

## 💡 Key Points

1. **One Call Creation**: Coordinator calls ONE API to create task + assign it
2. **No Task Pre-Creation**: No need to call `/api/manager/tasks` first
3. **Inline Task**: Task is created with the assignment
4. **Required Fields**: task, assignedToId, assignedBy, completionDate, employeeNumber, employeeEmail
5. **Reason Field**: Only required when status is NOT completed (UNABLE_TO_SUBMIT, REJECTED)
6. **Notifications**: Auto-sent to assigned users
7. **Employee Access**: Employees see tasks assigned to them via `/assigned-to/{userId}`

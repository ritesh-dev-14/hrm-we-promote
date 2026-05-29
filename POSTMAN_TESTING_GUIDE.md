# 🚀 Coordinator Assignment API - Quick Testing Guide

## Base URL
```
http://localhost:3000
```

---

## 📌 Step 1: Login as Coordinator

**POST** `http://localhost:3000/api/auth/login`

**Request Body:**
```json
{
  "email": "coordinator@test.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

✅ Copy the token and add to headers: `Authorization: Bearer <token>`

---

## 📌 Step 2: Create a Task (as Coordinator)

**POST** `http://localhost:3000/api/manager/tasks`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectName": "Coordinator Project",
  "description": "Task created by coordinator",
  "startDate": "2026-05-29T00:00:00Z",
  "endDate": "2026-06-15T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task-id-xxxxx",
    "projectName": "Coordinator Project",
    "status": "DRAFT"
  }
}
```

✅ Save the `task.id`

---

## 📌 Step 3: Create Coordinator Assignment

**POST** `http://localhost:3000/api/coordinator-assignments`

**Headers:**
```
Authorization: Bearer <coordinator_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "taskId": "task-id-xxxxx",
  "assignedToId": "d8f5e9c2-3a1b-4c8d-9e7f-6a2b5c1d8e9f",
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
    "id": "assignment-id-xxxxx",
    "taskId": "task-id-xxxxx",
    "task": {
      "projectName": "Coordinator Project"
    },
    "assignedTo": {
      "name": "Employee 1",
      "email": "employee1@test.com"
    },
    "assignedBy": "harsh",
    "status": "ASSIGNED",
    "completionDate": "2026-06-05T18:00:00.000Z"
  },
  "message": "Assignment created successfully"
}
```

✅ Save the `assignment.id`

---

## 📌 Step 4: Get My Assignments (Coordinator)

**GET** `http://localhost:3000/api/coordinator-assignments/my-assignments`

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
        "id": "assignment-id-xxxxx",
        "taskId": "task-id-xxxxx",
        "task": {
          "projectName": "Coordinator Project"
        },
        "assignedTo": {
          "name": "Employee 1"
        },
        "status": "ASSIGNED",
        "assignedBy": "harsh"
      }
    ],
    "pagination": {
      "total": 1
    }
  }
}
```

---

## 📌 Step 5: Get Assignments Assigned to a User

**GET** `http://localhost:3000/api/coordinator-assignments/assigned-to/d8f5e9c2-3a1b-4c8d-9e7f-6a2b5c1d8e9f`

**Headers:**
```
Authorization: Bearer <any_user_token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "assignment-id-xxxxx",
        "task": {
          "projectName": "Coordinator Project"
        },
        "assignedBy": "harsh",
        "status": "ASSIGNED"
      }
    ]
  }
}
```

---

## 📌 Step 6: Get Single Assignment

**GET** `http://localhost:3000/api/coordinator-assignments/assignment-id-xxxxx`

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
    "id": "assignment-id-xxxxx",
    "task": {
      "projectName": "Coordinator Project"
    },
    "assignedTo": {
      "name": "Employee 1",
      "email": "employee1@test.com"
    },
    "assignedBy": "harsh",
    "status": "ASSIGNED",
    "completionDate": "2026-06-05T18:00:00.000Z"
  }
}
```

---

## 📌 Step 7: Update Assignment Status - IN_PROGRESS

**PATCH** `http://localhost:3000/api/coordinator-assignments/assignment-id-xxxxx/status`

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Request Body:**
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
    "id": "assignment-id-xxxxx",
    "status": "IN_PROGRESS",
    "message": "Assignment status updated to IN_PROGRESS"
  },
  "message": "Assignment status updated successfully"
}
```

---

## 📌 Step 8: Update Assignment Status - COMPLETED

**PATCH** `http://localhost:3000/api/coordinator-assignments/assignment-id-xxxxx/status`

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Request Body:**
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
    "id": "assignment-id-xxxxx",
    "status": "COMPLETED",
    "completedAt": "2026-05-29T06:30:00.000Z"
  },
  "message": "Assignment status updated successfully"
}
```

---

## 📌 Step 9: Update Status - UNABLE_TO_SUBMIT (with Reason)

**PATCH** `http://localhost:3000/api/coordinator-assignments/assignment-id-xxxxx/status`

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Request Body:**
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
    "id": "assignment-id-xxxxx",
    "status": "UNABLE_TO_SUBMIT",
    "reason": "Missing required resources",
    "message": "Assignment status updated to UNABLE_TO_SUBMIT"
  },
  "message": "Assignment status updated successfully"
}
```

---

## 📌 Step 10: Update Status - REJECTED (with Reason)

**PATCH** `http://localhost:3000/api/coordinator-assignments/assignment-id-xxxxx/status`

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Request Body:**
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
    "id": "assignment-id-xxxxx",
    "status": "REJECTED",
    "reason": "Requirements are unclear",
    "rejectedAt": "2026-05-29T06:45:00.000Z"
  },
  "message": "Assignment status updated successfully"
}
```

---

## 📌 Step 11: List All Assignments (Admin/Coordinator)

**GET** `http://localhost:3000/api/coordinator-assignments`

**Headers:**
```
Authorization: Bearer <admin_or_coordinator_token>
Content-Type: application/json
```

**Query Parameters (Optional):**
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
        "id": "assignment-id-xxxxx",
        "task": {
          "projectName": "Coordinator Project"
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

| Role | Email | Password | Employee ID |
|------|-------|----------|-------------|
| Coordinator | coordinator@test.com | 123456 | COORD-001 |
| Employee 1 | employee1@test.com | 123456 | EMP-001 |
| Employee 2 | employee2@test.com | 123456 | EMP-002 |
| Employee 3 | employee3@test.com | 123456 | EMP-003 |
| Manager | manager@test.com | 123456 | MGR-001 |
| HR | hrwepromote@gmail.com | 123456 | HR-001 |
| Admin | admin@test.com | 123456 | ADMIN-001 |

---

## ✅ Valid Assignment Status Values

| Status | Requires Reason? | Used When |
|--------|------------------|-----------|
| IN_PROGRESS | No | Starting to work on task |
| SUBMITTED | No | Submitting work for review |
| COMPLETED | No | Task finished successfully |
| UNABLE_TO_SUBMIT | Yes | Cannot complete the task |
| REJECTED | Yes | Rejecting the assignment |

---

## ❌ Error Examples

**Authorization Missing:**
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

**Reason Required for UNABLE_TO_SUBMIT:**
```json
{
  "success": false,
  "message": "Reason is required for status: UNABLE_TO_SUBMIT"
}
```

**Duplicate Assignment:**
```json
{
  "success": false,
  "message": "This task is already assigned to this user"
}
```

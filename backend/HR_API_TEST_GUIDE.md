# HR API Testing Guide

## Base URL

```
http://localhost:8000/api
```

## Authentication

All endpoints require an `Authorization` header with Bearer token:

```
Authorization: Bearer YOUR_AUTH_TOKEN
```

---

## 1️⃣ CREATE MANAGER

### Endpoint

```
POST /api/hr/manager
```

### Headers

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_AUTH_TOKEN"
}
```

### Request Body

```json
{
  "name": "John Manager",
  "email": "john.manager@company.com",
  "password": "SecurePass@123",
  "department": "Sales",
  "employeeId": "MGR-12345"
}
```

### Curl Command

```bash
curl -X POST http://localhost:8000/api/hr/manager \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "name": "John Manager",
    "email": "john.manager@company.com",
    "password": "SecurePass@123",
    "department": "Sales",
    "employeeId": "MGR-12345"
  }'
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "employeeId": "MGR-12345",
    "name": "John Manager",
    "email": "john.manager@company.com",
    "role": "MANAGER",
    "department": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Sales"
    },
    "createdAt": "2026-05-14T10:30:00Z"
  }
}
```

### Error Response (400)

```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

## 2️⃣ CREATE EMPLOYEE

### Endpoint

```
POST /api/hr/employee
```

### Headers

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_AUTH_TOKEN"
}
```

### Request Body

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@company.com",
  "password": "SecurePass@123",
  "department": "Sales",
  "position": "Sales Executive",
  "role": "EMPLOYEE",
  "managerId": "550e8400-e29b-41d4-a716-446655440000",
  "employeeId": "EMP-54321"
}
```

### Curl Command

```bash
curl -X POST http://localhost:8000/api/hr/employee \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@company.com",
    "password": "SecurePass@123",
    "department": "Sales",
    "position": "Sales Executive",
    "role": "EMPLOYEE",
    "managerId": "550e8400-e29b-41d4-a716-446655440000",
    "employeeId": "EMP-54321"
  }'
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440111",
    "employeeId": "EMP-54321",
    "name": "Jane Doe",
    "email": "jane.doe@company.com",
    "role": "EMPLOYEE",
    "department": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Sales"
    },
    "position": "Sales Executive",
    "managerId": "550e8400-e29b-41d4-a716-446655440000",
    "manager": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Manager",
      "employeeId": "MGR-12345"
    },
    "createdAt": "2026-05-14T10:35:00Z"
  }
}
```

### Error Response (404)

```json
{
  "success": false,
  "message": "Manager not found"
}
```

---

## 3️⃣ GET ALL MANAGERS

### Endpoint

```
GET /api/hr/managers
```

### Curl Command

```bash
curl -X GET http://localhost:8000/api/hr/managers \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "employeeId": "MGR-12345",
      "name": "John Manager",
      "email": "john.manager@company.com",
      "role": "MANAGER",
      "department": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Sales"
      },
      "createdAt": "2026-05-14T10:30:00Z"
    }
  ]
}
```

---

## 4️⃣ GET ALL EMPLOYEES

### Endpoint

```
GET /api/hr/employees
```

### Curl Command

```bash
curl -X GET http://localhost:8000/api/hr/employees \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440111",
      "employeeId": "EMP-54321",
      "name": "Jane Doe",
      "email": "jane.doe@company.com",
      "role": "EMPLOYEE",
      "department": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Sales"
      },
      "position": "Sales Executive",
      "managerId": "550e8400-e29b-41d4-a716-446655440000",
      "manager": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Manager",
        "employeeId": "MGR-12345"
      },
      "createdAt": "2026-05-14T10:35:00Z"
    }
  ]
}
```

---

## 5️⃣ GET SPECIFIC MANAGER

### Endpoint

```
GET /api/hr/manager/{employeeId}
```

### Curl Command

```bash
curl -X GET http://localhost:8000/api/hr/manager/MGR-12345 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

## 6️⃣ GET SPECIFIC EMPLOYEE

### Endpoint

```
GET /api/hr/employee/{employeeId}
```

### Curl Command

```bash
curl -X GET http://localhost:8000/api/hr/employee/EMP-54321 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

## 7️⃣ UPDATE MANAGER

### Endpoint

```
PUT /api/hr/manager/{employeeId}
```

### Request Body

```json
{
  "name": "John Manager Updated",
  "email": "john.manager.new@company.com",
  "password": "NewSecurePass@123",
  "department": "Sales",
  "position": "Senior Manager"
}
```

### Curl Command

```bash
curl -X PUT http://localhost:8000/api/hr/manager/MGR-12345 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "name": "John Manager Updated",
    "email": "john.manager.new@company.com",
    "password": "NewSecurePass@123",
    "department": "Sales",
    "position": "Senior Manager"
  }'
```

---

## 8️⃣ UPDATE EMPLOYEE

### Endpoint

```
PUT /api/hr/employee/{employeeId}
```

### Request Body

```json
{
  "name": "Jane Doe Updated",
  "email": "jane.doe.new@company.com",
  "department": "Marketing",
  "position": "Senior Sales Executive",
  "password": "NewPass@123"
}
```

### Curl Command

```bash
curl -X PUT http://localhost:8000/api/hr/employee/EMP-54321 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "name": "Jane Doe Updated",
    "email": "jane.doe.new@company.com",
    "department": "Marketing",
    "position": "Senior Sales Executive",
    "password": "NewPass@123"
  }'
```

---

## 9️⃣ DELETE MANAGER

### Endpoint

```
DELETE /api/hr/manager/{employeeId}
```

### Curl Command

```bash
curl -X DELETE http://localhost:8000/api/hr/manager/MGR-12345 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Manager deleted successfully"
}
```

---

## 🔟 DELETE EMPLOYEE

### Endpoint

```
DELETE /api/hr/employee/{employeeId}
```

### Curl Command

```bash
curl -X DELETE http://localhost:8000/api/hr/employee/EMP-54321 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

---

## 📋 Validation Rules

### Create Manager

- **name**: Required, string (min 2, max 100 chars)
- **email**: Required, valid email format, must be unique
- **password**: Required, minimum 6 characters
- **department**: Optional, string
- **employeeId**: Optional, auto-generated if not provided (format: MGR-{timestamp})

### Create Employee

- **name**: Required, string (min 2, max 100 chars)
- **email**: Required, valid email format, must be unique
- **password**: Required, minimum 6 characters
- **department**: Optional, string
- **position**: Optional, string
- **role**: Required, must be "EMPLOYEE"
- **managerId**: Optional, must be a valid manager UUID
- **employeeId**: Optional, auto-generated if not provided (format: EMP-{timestamp})

---

## 🔐 Authorization Requirements

- All endpoints require HR role
- Token must be valid and not expired
- User must be authenticated

---

## ⚠️ Common Errors

| Status | Error                | Solution                                 |
| ------ | -------------------- | ---------------------------------------- |
| 400    | Email already exists | Use a unique email address               |
| 401    | Unauthorized         | Ensure valid bearer token in header      |
| 403    | Forbidden            | Only HR users can access these endpoints |
| 404    | Manager not found    | Use correct manager UUID                 |
| 422    | Validation failed    | Check all required fields                |

---

## 🚀 Quick Test Sequence

1. **Create Manager** → Get manager ID
2. **Create Employee** → Assign to manager (use manager ID)
3. **Get All Managers** → Verify manager exists
4. **Get All Employees** → Verify employee exists
5. **Get Specific Employee** → Verify employee details including manager
6. **Update Employee** → Modify details
7. **Delete Employee** → Remove employee

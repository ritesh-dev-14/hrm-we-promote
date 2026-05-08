# Error Handling Architecture & Best Practices

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                       │
│                   (React/Vue/Next.js)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              HTTP Request (with Auth Token)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express Server                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Route Handler                              │   │
│  │   (Controller → Service → Database)                 │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │                                             │
│                 ├─→ Success (200)                            │
│                 │                                             │
│                 ├─→ Validation Error (400)                   │
│                 │   throw new ApiError(400, ERRORS.*)        │
│                 │                                             │
│                 ├─→ Unauthorized (401)                       │
│                 │   throw new ApiError(401, ERRORS.AUTH.*)   │
│                 │                                             │
│                 ├─→ Forbidden (403)                          │
│                 │   throw new ApiError(403, ERRORS.AUTH.*)   │
│                 │                                             │
│                 ├─→ Not Found (404)                          │
│                 │   throw new ApiError(404, ERRORS.*.*)      │
│                 │                                             │
│                 └─→ Unexpected Error (500)                   │
│                     Caught by Error Middleware               │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Error Middleware                              │   │
│  │  (Catches and Formats Errors)                        │   │
│  │                                                       │   │
│  │  - If operational: Format as JSON response           │   │
│  │  - If not operational: Generic error message         │   │
│  └──────────────┬───────────────────────────────────────┘   │
└─────────────────┼──────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│           JSON Response (Error or Success)                   │
│   {                                                          │
│     "success": false,                                        │
│     "code": "ERROR_CODE_001",                               │
│     "message": "User-friendly message for toast"            │
│   }                                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Response Interceptor                            │
│  - Check HTTP status                                         │
│  - Extract error message                                     │
│  - Show toast notification                                   │
│  - Handle redirect if needed                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Handling Layers

### Layer 1: Input Validation (Middleware)
**File**: `src/middlewares/validate.middleware.js`

**Purpose**: Validate request data before it reaches the service

**Behavior**:
- Uses Joi schema validation
- Returns 400 Bad Request if validation fails
- Provides specific field error messages

**Example**:
```javascript
// If email format is invalid
{
  "success": false,
  "code": "VAL_003",
  "message": "Invalid email format. Please enter a valid email address."
}
```

---

### Layer 2: Business Logic Validation (Service)
**File**: `src/modules/*/[module].service.js`

**Purpose**: Check business rules and database constraints

**Behavior**:
- Verify resources exist before operations
- Check user permissions and roles
- Validate state transitions
- Throw ApiError with specific code and message

**Example**: Create Employee Service
```javascript
// Check if manager exists
if (body.managerId) {
  manager = await prisma.user.findUnique({
    where: { employeeId: body.managerId }
  });
  
  if (!manager) {
    throw new ApiError(404, ERRORS.HR.MANAGER_NOT_FOUND);
  }
  
  if (manager.role !== "MANAGER") {
    throw new ApiError(400, ERRORS.HR.INVALID_USER_TYPE);
  }
}
```

---

### Layer 3: Role-Based Authorization (Middleware)
**File**: `src/middlewares/role.middleware.js`

**Purpose**: Ensure user has required role for the operation

**Behavior**:
- Checks user.role against required role
- Returns 403 Forbidden if unauthorized
- Applied to protected routes

**Usage**:
```javascript
router.post("/employee", auth, role("HR"), validate(...), controller.createEmployee);
//                                ^^^ 
//                    Only HR users can access
```

---

### Layer 4: Error Handling Middleware
**File**: `src/middlewares/error.middleware.js`

**Purpose**: Centralized error formatting and logging

**Behavior**:
- Catches all errors from route handlers
- If operational: Format with code and message
- If not operational: Generic 500 error
- Console logs for debugging

**Response Format**:
```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "User-friendly message"
}
```

---

## Error Object Structure

### ApiError Class
**File**: `src/utils/ApiError.js`

```javascript
class ApiError extends Error {
  constructor(statusCode, error) {
    super(error.message);
    this.statusCode = statusCode;      // HTTP status (400, 401, etc.)
    this.code = error.code;             // Unique error code (AUTH_001)
    this.isOperational = true;          // Mark as operational error
  }
}
```

### Usage Pattern
```javascript
throw new ApiError(400, ERRORS.USER.DUPLICATE_EMAIL);
// Results in:
// {
//   statusCode: 400,
//   code: "USER_002",
//   message: "This email is already registered. Please use a different email."
// }
```

---

## ERRORS Object - Centralized Error Definitions
**File**: `src/utils/errors.js`

**Structure**:
```javascript
module.exports = {
  CATEGORY: {
    ERROR_NAME: {
      code: "CAT_001",
      message: "User-friendly message"
    }
  }
}
```

**Categories**:
- `AUTH` - Authentication and authorization errors
- `USER` - User not found, duplicate email, etc.
- `HR` - HR module specific errors
- `ATTENDANCE` - Attendance state errors
- `LEAVE` - Leave application and approval errors
- `TASK` - Task assignment and submission errors
- `VALIDATION` - Input validation errors
- `SERVER` - Internal server errors

---

## Error Handling by HTTP Status Code

### 400 - Bad Request
**Meaning**: Client error in validation or business logic

**Causes**:
- Invalid input format
- Missing required field
- Business rule violation
- Invalid state transition

**Example Errors**:
```javascript
ERRORS.VALIDATION.INVALID_INPUT          // Invalid format
ERRORS.LEAVE.INVALID_DATES                // End before start
ERRORS.ATTENDANCE.ALREADY_STARTED        // Already started work
```

**Frontend Action**:
```javascript
if (error.status === 400) {
  toast.error(error.data.message);  // Show the specific problem
}
```

---

### 401 - Unauthorized
**Meaning**: Authentication required but missing/invalid

**Causes**:
- No token provided
- Invalid/expired token
- Invalid credentials

**Example Errors**:
```javascript
ERRORS.AUTH.INVALID_CREDENTIALS
ERRORS.AUTH.TOKEN_EXPIRED
```

**Frontend Action**:
```javascript
if (error.status === 401) {
  // Clear stored token
  localStorage.removeItem('token');
  // Redirect to login
  window.location.href = '/login';
  // Show message
  toast.error('Session expired. Please login again.');
}
```

---

### 403 - Forbidden
**Meaning**: Authenticated but insufficient permissions

**Causes**:
- Wrong role for endpoint
- Trying to access other user's data
- Not authorized for operation

**Example Errors**:
```javascript
ERRORS.AUTH.ACCESS_DENIED                 // Wrong role
ERRORS.AUTH.UNAUTHORIZED                  // No permission
```

**Frontend Action**:
```javascript
if (error.status === 403) {
  toast.error(error.data.message);
  // Optionally redirect to dashboard or home
}
```

---

### 404 - Not Found
**Meaning**: Resource doesn't exist

**Causes**:
- User/Employee doesn't exist
- Task/Leave not found
- Invalid ID provided

**Example Errors**:
```javascript
ERRORS.USER.NOT_FOUND
ERRORS.HR.EMPLOYEE_NOT_FOUND
ERRORS.LEAVE.NOT_FOUND
```

**Frontend Action**:
```javascript
if (error.status === 404) {
  toast.warning(error.data.message);
  // Optionally refresh list or redirect
}
```

---

### 500 - Internal Server Error
**Meaning**: Unexpected server error

**Causes**:
- Database error
- Unhandled exception
- Service unavailable

**Response**:
```json
{
  "success": false,
  "message": "An unexpected error occurred. Please try again later."
}
```

**Frontend Action**:
```javascript
if (error.status === 500) {
  toast.error('Server error. Please try again later.');
  // Optionally log to error tracking service
}
```

---

## Implementation Examples

### Example 1: Creating an Employee with Error Handling

**API Call**:
```javascript
const response = await fetch('/api/hr/employee', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: "Jane Doe",
    email: "jane@company.com",
    password: "securePass123",
    role: "EMPLOYEE",
    department: "Engineering",
    position: "Developer",
    managerId: "MGR-001"
  })
});
```

**Possible Error Scenarios**:

1. **Invalid Email Format (400)**
   ```json
   {
     "success": false,
     "code": "VAL_003",
     "message": "Invalid email format. Please enter a valid email address."
   }
   ```
   Toast: ❌ "Invalid email format. Please enter a valid email address."

2. **Duplicate Email (400)**
   ```json
   {
     "success": false,
     "code": "USER_002",
     "message": "This email is already registered. Please use a different email."
   }
   ```
   Toast: ❌ "This email is already registered. Please use a different email."

3. **Manager Not Found (404)**
   ```json
   {
     "success": false,
     "code": "HR_001",
     "message": "Manager not found. Please verify the manager ID."
   }
   ```
   Toast: ⚠️ "Manager not found. Please verify the manager ID."

4. **Not Authorized - Not HR (403)**
   ```json
   {
     "success": false,
     "code": "AUTH_005",
     "message": "Access denied. Insufficient permissions for this operation."
   }
   ```
   Toast: ❌ "Access denied. Insufficient permissions for this operation."

---

### Example 2: Applying Leave with Error Handling

**API Call**:
```javascript
const response = await fetch('/api/employee/leave', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    startDate: "2026-05-15",
    endDate: "2026-05-20",
    type: "CASUAL",
    reason: "Personal work"
  })
});
```

**Possible Error Scenarios**:

1. **Invalid Leave Dates (400)**
   ```json
   {
     "success": false,
     "code": "LEAVE_001",
     "message": "Invalid leave dates. End date cannot be before start date."
   }
   ```
   Toast: ❌ "Invalid leave dates. End date cannot be before start date."

2. **Leave Already Applied (400)**
   ```json
   {
     "success": false,
     "code": "LEAVE_003",
     "message": "Leave already applied for the selected dates. Please check your leave history."
   }
   ```
   Toast: ❌ "Leave already applied for the selected dates. Please check your leave history."

3. **Insufficient Leave Balance (400)**
   ```json
   {
     "success": false,
     "code": "LEAVE_004",
     "message": "Insufficient leave balance. You do not have enough leaves for this period."
   }
   ```
   Toast: ❌ "Insufficient leave balance. You do not have enough leaves for this period."

---

## Best Practices Implemented

### ✅ Consistent Error Format
All errors follow the same structure:
```json
{
  "success": false,
  "code": "UNIQUE_ERROR_CODE",
  "message": "User-friendly message"
}
```

### ✅ Unique Error Codes
Each error has a unique code for tracking:
- `AUTH_001` - Invalid credentials
- `USER_002` - Duplicate email
- `LEAVE_004` - Insufficient balance
- etc.

### ✅ User-Friendly Messages
All messages are clear and actionable:
- ❌ Bad: "User not found"
- ✅ Good: "Employee not found. Please verify the employee ID."

### ✅ Centralized Error Definitions
All errors defined in one file (`src/utils/errors.js`):
- Easy to maintain
- Consistent across application
- Reusable in multiple modules

### ✅ Role-Based Access Control
Endpoints are protected with role middleware:
```javascript
router.post("/employee", auth, role("HR"), validate(...), controller);
```

### ✅ Error Logging
Errors are console logged for debugging (production: use error tracking service)

### ✅ No Sensitive Information
Error messages don't expose:
- Database errors
- Password details
- Internal system information

---

## Frontend Integration Checklist

- [ ] **API Interceptor**: Add error interceptor for all API calls
- [ ] **Toast Notifications**: Show appropriate toast for each status code
- [ ] **Token Management**: Clear token on 401, redirect to login
- [ ] **Error Codes**: Use error codes for conditional logic if needed
- [ ] **User Messages**: Display `response.data.message` in toasts
- [ ] **Loading States**: Show loading during API calls
- [ ] **Retry Logic**: Implement retry for 5xx errors
- [ ] **Logging**: Log errors to error tracking service (Sentry, etc.)
- [ ] **Forms**: Show validation errors inline if using form-specific validation
- [ ] **Network Issues**: Handle network errors separately from API errors

---

## Production Recommendations

### Error Tracking
```javascript
// Use Sentry or similar service
import * as Sentry from "@sentry/react";

Sentry.captureException(error);
```

### Logging
```javascript
// Use structured logging
logger.error('API Error', {
  code: error.data.code,
  message: error.data.message,
  status: error.status,
  endpoint: error.config.url
});
```

### Rate Limiting
Implement rate limiting to prevent brute force attacks on:
- Login endpoint
- Create endpoints
- API endpoints in general

### Error Monitoring
Set up alerts for:
- 500 errors
- Repeated 400 errors on same endpoint
- Authentication failures

---

## Testing Error Scenarios

**Test Cases for Each Endpoint**:

1. ✅ **Success Case** - Valid input, returns 200
2. ❌ **Missing Fields** - Returns 400 with validation message
3. ❌ **Invalid Data** - Returns 400 with specific error
4. ❌ **Not Found** - Returns 404 with not found message
5. ❌ **Unauthorized** - Returns 401 with auth error
6. ❌ **Forbidden** - Returns 403 with permission error
7. ❌ **Duplicate** - Returns 400 with duplicate message
8. ❌ **Invalid State** - Returns 400 with state error

---

**Last Updated**: May 8, 2026
**Status**: Comprehensive Error Handling System Ready ✅

**All endpoints now gracefully handle errors with user-friendly messages suitable for frontend toast notifications.**

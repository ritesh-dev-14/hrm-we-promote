# Error Handling Guide - Frontend Integration

## Overview
All API responses are now structured with graceful error messages designed for frontend toast notifications. Every error includes:
- **HTTP Status Code** - Indicates the type of error
- **Error Code** - Unique identifier (e.g., AUTH_001)
- **User-Friendly Message** - Ready for toast display

---

## Error Response Format

### Standard Error Response
```json
{
  "success": false,
  "code": "ERROR_CODE_001",
  "message": "User-friendly error message for toast notification"
}
```

### Example Error Response
```json
{
  "success": false,
  "code": "AUTH_001",
  "message": "Invalid email or password. Please check and try again."
}
```

---

## HTTP Status Codes & Meanings

| Status | Meaning | Action | Toast Type |
|--------|---------|--------|-----------|
| **400** | Bad Request (Validation/Logic Error) | Show error message | Error 🔴 |
| **401** | Unauthorized (Not logged in) | Redirect to login | Error 🔴 |
| **403** | Forbidden (Insufficient permissions) | Show error, suggest contact admin | Error 🔴 |
| **404** | Not Found (Resource doesn't exist) | Show error, suggest refresh | Warning 🟡 |
| **500** | Internal Server Error | Show generic error, suggest retry | Error 🔴 |

---

## AUTH Module - `/api/auth` Errors

### LOGIN Endpoint
**POST** `/api/auth/login`

#### Error Cases:

**1. Invalid Credentials (400)**
```json
{
  "success": false,
  "code": "AUTH_001",
  "message": "Invalid email or password. Please check and try again."
}
```
**Toast**: ❌ Error - "Invalid email or password. Please check and try again."

**2. Missing Required Fields (400)**
```json
{
  "success": false,
  "code": "VAL_002",
  "message": "Missing required field. Please fill in all required fields."
}
```
**Toast**: ❌ Error - "Missing required field. Please fill in all required fields."

---

## ATTENDANCE Module - `/api/attendance` Errors

### START WORK Endpoint
**POST** `/api/attendance/start`

#### Error Cases:

**1. Work Already Started (400)**
```json
{
  "success": false,
  "code": "ATT_001",
  "message": "You have already started work today. Please end the current session first."
}
```
**Toast**: ❌ Error - "You have already started work today. Please end the current session first."

**2. Not Authenticated (401)**
```json
{
  "success": false,
  "code": "AUTH_002",
  "message": "You are not authorized to access this resource."
}
```
**Toast**: ❌ Error - "You are not authorized to access this resource."

---

### STOP WORK Endpoint
**POST** `/api/attendance/stop`

#### Error Cases:

**1. Work Not Started (400)**
```json
{
  "success": false,
  "code": "ATT_002",
  "message": "Work not started. Please start work before stopping."
}
```
**Toast**: ❌ Error - "Work not started. Please start work before stopping."

**2. Break Still Active (400)**
```json
{
  "success": false,
  "code": "ATT_003",
  "message": "Break is currently active. Please end the break before stopping work."
}
```
**Toast**: ❌ Error - "Break is currently active. Please end the break before stopping work."

**3. Work Already Stopped (400)**
```json
{
  "success": false,
  "code": "ATT_005",
  "message": "Work has already been stopped for today."
}
```
**Toast**: ❌ Error - "Work has already been stopped for today."

---

### START BREAK Endpoint
**POST** `/api/attendance/break/start`

#### Error Cases:

**1. Work Not Started (400)**
```json
{
  "success": false,
  "code": "ATT_002",
  "message": "Work not started. Please start work before taking a break."
}
```
**Toast**: ❌ Error - "Work not started. Please start work before taking a break."

**2. Break Already Active (400)**
```json
{
  "success": false,
  "code": "ATT_003",
  "message": "Break is currently active. Please end the current break first."
}
```
**Toast**: ❌ Error - "Break is currently active. Please end the current break first."

---

### END BREAK Endpoint
**POST** `/api/attendance/break/end`

#### Error Cases:

**1. No Active Break (400)**
```json
{
  "success": false,
  "code": "ATT_004",
  "message": "No active break found. Please start a break first."
}
```
**Toast**: ❌ Error - "No active break found. Please start a break first."

---

## HR Module - `/api/hr` Errors

### CREATE MANAGER Endpoint
**POST** `/api/hr/manager`

#### Error Cases:

**1. Duplicate Email (400)**
```json
{
  "success": false,
  "code": "USER_002",
  "message": "This email is already registered. Please use a different email."
}
```
**Toast**: ❌ Error - "This email is already registered. Please use a different email."

**2. Missing Required Fields (400)**
```json
{
  "success": false,
  "code": "VAL_002",
  "message": "Missing required field. Please fill in all required fields."
}
```
**Toast**: ❌ Error - "Missing required field. Please fill in all required fields."

**3. Not Authorized (403)**
```json
{
  "success": false,
  "code": "AUTH_005",
  "message": "Access denied. Insufficient permissions for this operation."
}
```
**Toast**: ❌ Error - "Access denied. Insufficient permissions for this operation."

---

### CREATE EMPLOYEE Endpoint
**POST** `/api/hr/employee`

#### Error Cases:

**1. Manager Not Found (404)**
```json
{
  "success": false,
  "code": "HR_001",
  "message": "Manager not found. Please verify the manager ID."
}
```
**Toast**: ⚠️ Warning - "Manager not found. Please verify the manager ID."

**2. Assigned User Not a Manager (400)**
```json
{
  "success": false,
  "code": "HR_003",
  "message": "Invalid user type. The selected user is not a manager."
}
```
**Toast**: ❌ Error - "Invalid user type. The selected user is not a manager."

**3. Duplicate Email (400)**
```json
{
  "success": false,
  "code": "USER_002",
  "message": "This email is already registered. Please use a different email."
}
```
**Toast**: ❌ Error - "This email is already registered. Please use a different email."

---

### GET EMPLOYEE Endpoint
**GET** `/api/hr/employee/:employeeId`

#### Error Cases:

**1. Employee Not Found (404)**
```json
{
  "success": false,
  "code": "HR_002",
  "message": "Employee not found. Please verify the employee ID."
}
```
**Toast**: ⚠️ Warning - "Employee not found. Please verify the employee ID."

---

### UPDATE EMPLOYEE Endpoint
**PUT** `/api/hr/employee/:employeeId`

#### Error Cases:

**1. Employee Not Found (404)**
```json
{
  "success": false,
  "code": "HR_002",
  "message": "Employee not found. Please verify the employee ID."
}
```
**Toast**: ⚠️ Warning - "Employee not found. Please verify the employee ID."

**2. Duplicate Email (400)**
```json
{
  "success": false,
  "code": "USER_002",
  "message": "This email is already registered. Please use a different email."
}
```
**Toast**: ❌ Error - "This email is already registered. Please use a different email."

---

### DELETE EMPLOYEE Endpoint
**DELETE** `/api/hr/employee/:employeeId`

#### Error Cases:

**1. Employee Not Found (404)**
```json
{
  "success": false,
  "code": "HR_002",
  "message": "Employee not found. Please verify the employee ID."
}
```
**Toast**: ⚠️ Warning - "Employee not found. Please verify the employee ID."

---

## LEAVE Module - `/api/hr` & `/api/employee` Errors

### APPLY LEAVE Endpoint
**POST** `/api/employee/leave`

#### Error Cases:

**1. Invalid Leave Dates (400)**
```json
{
  "success": false,
  "code": "LEAVE_001",
  "message": "Invalid leave dates. End date cannot be before start date."
}
```
**Toast**: ❌ Error - "Invalid leave dates. End date cannot be before start date."

**2. Past Dates (400)**
```json
{
  "success": false,
  "code": "LEAVE_002",
  "message": "Cannot apply leave for past dates. Please select future dates."
}
```
**Toast**: ❌ Error - "Cannot apply leave for past dates. Please select future dates."

**3. Already Applied (400)**
```json
{
  "success": false,
  "code": "LEAVE_003",
  "message": "Leave already applied for the selected dates. Please check your leave history."
}
```
**Toast**: ❌ Error - "Leave already applied for the selected dates. Please check your leave history."

**4. Insufficient Leave Balance (400)**
```json
{
  "success": false,
  "code": "LEAVE_004",
  "message": "Insufficient leave balance. You do not have enough leaves for this period."
}
```
**Toast**: ❌ Error - "Insufficient leave balance. You do not have enough leaves for this period."

**5. Invalid Leave Type (400)**
```json
{
  "success": false,
  "code": "LEAVE_005",
  "message": "Invalid leave type. Please select CASUAL or SICK leave."
}
```
**Toast**: ❌ Error - "Invalid leave type. Please select CASUAL or SICK leave."

**6. Monthly Limit Exceeded (400)**
```json
{
  "success": false,
  "code": "LEAVE_009",
  "message": "Monthly casual leave limit exceeded. Only 1 casual leave allowed per month."
}
```
**Toast**: ❌ Error - "Monthly casual leave limit exceeded. Only 1 casual leave allowed per month."

---

### APPROVE/REJECT LEAVE Endpoint
**PUT** `/api/hr/leave/:id`

#### Error Cases:

**1. Invalid Status (400)**
```json
{
  "success": false,
  "code": "LEAVE_001",
  "message": "Invalid status. Please select APPROVED or REJECTED."
}
```
**Toast**: ❌ Error - "Invalid status. Please select APPROVED or REJECTED."

**2. Leave Not Found (404)**
```json
{
  "success": false,
  "code": "LEAVE_006",
  "message": "Leave request not found. Please verify the leave ID."
}
```
**Toast**: ⚠️ Warning - "Leave request not found. Please verify the leave ID."

**3. Already Processed (400)**
```json
{
  "success": false,
  "code": "LEAVE_007",
  "message": "This leave has already been processed. Cannot modify."
}
```
**Toast**: ❌ Error - "This leave has already been processed. Cannot modify."

**4. Rejection Reason Required (400)**
```json
{
  "success": false,
  "code": "LEAVE_008",
  "message": "Please provide a reason for rejecting this leave."
}
```
**Toast**: ❌ Error - "Please provide a reason for rejecting this leave."

**5. Insufficient Balance (400)**
```json
{
  "success": false,
  "code": "LEAVE_004",
  "message": "Insufficient leave balance. Not enough leaves to approve this request."
}
```
**Toast**: ❌ Error - "Insufficient leave balance. Not enough leaves to approve this request."

**6. Unauthorized (403)**
```json
{
  "success": false,
  "code": "AUTH_005",
  "message": "Access denied. Insufficient permissions for this operation."
}
```
**Toast**: ❌ Error - "Access denied. Insufficient permissions for this operation."

---

## TASK Module - `/api/manager/tasks` Errors

### CREATE TASK Endpoint
**POST** `/api/manager/tasks/`

#### Error Cases:

**1. Not Authorized - Not a Manager (403)**
```json
{
  "success": false,
  "code": "AUTH_005",
  "message": "Access denied. Only managers can create tasks."
}
```
**Toast**: ❌ Error - "Access denied. Only managers can create tasks."

**2. Invalid Setup Type (400)**
```json
{
  "success": false,
  "code": "TASK_006",
  "message": "Invalid setup type. Please select PREMIUM, VERY_PREMIUM, or PHONE."
}
```
**Toast**: ❌ Error - "Invalid setup type. Please select PREMIUM, VERY_PREMIUM, or PHONE."

---

### ASSIGN TASK Endpoint
**POST** `/api/manager/tasks/:id/assign`

#### Error Cases:

**1. Task Not Found (404)**
```json
{
  "success": false,
  "code": "TASK_001",
  "message": "Task not found. Please verify the task ID."
}
```
**Toast**: ⚠️ Warning - "Task not found. Please verify the task ID."

**2. Not Your Task (403)**
```json
{
  "success": false,
  "code": "AUTH_005",
  "message": "Access denied. You can only assign your own tasks."
}
```
**Toast**: ❌ Error - "Access denied. You can only assign your own tasks."

---

### SUBMIT TASK Endpoint
**POST** `/api/employee/task/:id/submit`

#### Error Cases:

**1. Assignment Not Found (404)**
```json
{
  "success": false,
  "code": "TASK_001",
  "message": "Task assignment not found. Please verify the task ID."
}
```
**Toast**: ⚠️ Warning - "Task assignment not found. Please verify the task ID."

**2. Not Your Task (403)**
```json
{
  "success": false,
  "code": "AUTH_005",
  "message": "Access denied. This task is not assigned to you."
}
```
**Toast**: ❌ Error - "Access denied. This task is not assigned to you."

**3. Already Submitted (400)**
```json
{
  "success": false,
  "code": "TASK_003",
  "message": "This task has already been submitted."
}
```
**Toast**: ❌ Error - "This task has already been submitted."

**4. Invalid Submission (400)**
```json
{
  "success": false,
  "code": "TASK_004",
  "message": "Invalid submission data. Please provide valid numbers for completed and pending counts."
}
```
**Toast**: ❌ Error - "Invalid submission data. Please provide valid numbers for completed and pending counts."

---

## EMPLOYEE Module - `/api/employee` Errors

### GET ASSIGNED TASKS Endpoint
**GET** `/api/employee/tasks`

#### Error Cases:

**1. No Tasks (200 - Success with empty array)**
```json
{
  "success": true,
  "data": []
}
```
**Toast**: ℹ️ Info - "No tasks assigned to you at this time."

---

### GET MY LEAVES Endpoint
**GET** `/api/employee/leaves`

#### Error Cases:

**1. No Leaves (200 - Success with empty array)**
```json
{
  "success": true,
  "data": []
}
```
**Toast**: ℹ️ Info - "You haven't applied for any leaves yet."

---

### GET LEAVE BALANCE Endpoint
**GET** `/api/employee/leave-balance`

#### Error Cases:

**1. No Balance Data (200 - Success)**
```json
{
  "success": true,
  "data": {
    "casualLeft": 14,
    "sickLeft": 6
  }
}
```
**Note**: This endpoint returns success even if it's the first time.

---

## Server Errors (5xx) - General Handling

### Internal Server Error (500)
```json
{
  "success": false,
  "message": "An unexpected error occurred. Please try again later."
}
```
**Toast**: ❌ Error - "An unexpected error occurred. Please try again later."
**Action**: Show error, suggest refresh/retry, optionally log issue

---

## Frontend Implementation Guide

### React/Vue Toast Implementation

**Example Toast Configuration:**

```javascript
// For Error Toast (400, 401, 403)
toast.error(response.data.message, {
  duration: 4000,
  position: 'top-right',
  icon: '❌'
});

// For Warning Toast (404)
toast.warning(response.data.message, {
  duration: 4000,
  position: 'top-right',
  icon: '⚠️'
});

// For Info Toast (200 with empty data)
toast.info('No items found.', {
  duration: 3000,
  position: 'top-right',
  icon: 'ℹ️'
});

// For Success Toast (200)
toast.success(response.data.message || 'Operation successful', {
  duration: 3000,
  position: 'top-right',
  icon: '✅'
});
```

### API Error Interceptor Pattern

```javascript
// Axios/Fetch interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || 
                   'An error occurred. Please try again.';
    const code = error.response?.data?.code;
    
    // Show toast with message
    toast.error(message, {
      duration: 4000,
      position: 'top-right'
    });
    
    return Promise.reject(error);
  }
);
```

### HTTP Status Code Handling

```javascript
const handleError = (error) => {
  switch(error.response?.status) {
    case 400:
      // Show error toast (validation/logic error)
      toast.error(error.response.data.message);
      break;
    
    case 401:
      // Redirect to login
      redirectToLogin();
      break;
    
    case 403:
      // Show access denied
      toast.error(error.response.data.message);
      break;
    
    case 404:
      // Show warning
      toast.warning(error.response.data.message);
      break;
    
    case 500:
      // Show generic error
      toast.error('Server error. Please try again later.');
      break;
    
    default:
      toast.error('An unexpected error occurred.');
  }
};
```

---

## Success Responses - Expected Messages

### Successful Operations (200)
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```
**Toast**: ✅ Success - Show relevant success message

### Examples:

**Create Employee Success:**
```json
{
  "success": true,
  "data": { /* employee details */ }
}
```
**Toast**: ✅ Success - "Employee created successfully"

**Approve Leave Success:**
```json
{
  "success": true,
  "message": "Leave updated successfully",
  "data": { /* leave details */ }
}
```
**Toast**: ✅ Success - "Leave updated successfully"

**Start Work Success:**
```json
{
  "success": true,
  "data": { /* attendance record */ }
}
```
**Toast**: ✅ Success - "Work started successfully"

---

## Error Code Reference

| Code | HTTP | Category | Toast Type |
|------|------|----------|-----------|
| AUTH_001 | 401 | Authentication | Error ❌ |
| AUTH_002 | 403 | Authorization | Error ❌ |
| AUTH_005 | 403 | Permission | Error ❌ |
| USER_001 | 404 | User Not Found | Warning ⚠️ |
| USER_002 | 400 | Duplicate Email | Error ❌ |
| HR_001 | 404 | Manager Not Found | Warning ⚠️ |
| HR_002 | 404 | Employee Not Found | Warning ⚠️ |
| ATT_001 | 400 | Work Already Started | Error ❌ |
| ATT_002 | 400 | Work Not Started | Error ❌ |
| LEAVE_001 | 400 | Invalid Dates | Error ❌ |
| LEAVE_004 | 400 | Insufficient Balance | Error ❌ |
| TASK_001 | 404 | Task Not Found | Warning ⚠️ |
| VAL_002 | 400 | Missing Field | Error ❌ |

---

## Testing Checklist for Error Handling

- [ ] All validation errors show helpful messages
- [ ] All 404 errors show resource not found message
- [ ] All 403 errors show permission denied message
- [ ] All 400 errors show specific problem details
- [ ] All 401 errors redirect to login
- [ ] All 500 errors show generic error message
- [ ] Toast messages are user-friendly
- [ ] Error codes are unique and trackable
- [ ] No hardcoded error strings in code
- [ ] All error messages use ERRORS object
- [ ] Frontend can parse error codes for logic
- [ ] No sensitive information in error messages

---

**Last Updated**: May 8, 2026
**Status**: Comprehensive Error Handling Implemented ✅

**Frontend Ready**: All endpoints return user-friendly error messages suitable for toast notifications

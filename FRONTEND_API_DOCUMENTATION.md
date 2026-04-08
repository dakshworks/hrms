# HRMS Frontend API Documentation

**Backend Base URL:** `http://localhost:8080/api`

**Version:** 2.0.0  
**Last Updated:** April 8, 2026

---

## Table of Contents
1. [Authentication](#authentication)
2. [Employee Profile](#employee-profile)
3. [Attendance Management](#attendance-management)
4. [Leave & WFH Management](#leave--wfh-management)
5. [Dashboard](#dashboard)
6. [Data Entities](#data-entities)
7. [Error Handling](#error-handling)
8. [Authentication Flow](#authentication-flow)
9. [Response Format Standard](#response-format-standard)

---

## Response Format Standard

All backend responses follow this standard envelope:

```json
{
  "success": true | false,
  "message": "Human-readable status message",
  "timestamp": "2026-04-08T12:00:00",
  "data": { /* payload or null */ }
}
```

**Frontend Handling:**
- Axios interceptor automatically extracts `data.data` for most endpoints
- Login endpoint requires special handling to access token
- Error responses use `data.message` or `data.data` for validation errors

---

## Authentication

### 1. User Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huQGNvbXBhbnkuY29tIi...",
    "type": "Bearer",
    "employeeId": 42,
    "email": "john@company.com",
    "role": "ROLE_EMPLOYEE"
  }
}
```

**Notes:**
- Token valid for 24 hours
- Frontend stores token in localStorage under key `auth`
- Auth object structure: `{ employeeId, username, email, role, token }`
- Role includes `ROLE_` prefix - strip to `EMPLOYEE` for frontend use
- All subsequent requests include `Authorization: Bearer {token}` header

---

### 2. User Registration
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "password": "secure123",
  "department": "Engineering",
  "role": "EMPLOYEE",
  "phoneNumber": "9876543210",
  "designation": "Software Engineer",
  "employmentType": "FULL_TIME",
  "dateOfJoining": "2025-07-15"
}
```

**Validation Requirements:**
- `name`: Required, string
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `department`: Required
- `role`: Required (ADMIN | HR | EMPLOYEE)
- `phoneNumber`: Optional, 10-digit Indian mobile
- `dateOfJoining`: Optional, past or present

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "timestamp": "2026-04-08T12:00:00",
  "data": null
}
```

---

### 3. Get Current User ⭐ NEW ENDPOINT REQUIRED
**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "employeeId": 42,
    "username": "John Doe",
    "email": "john@company.com",
    "role": "ROLE_EMPLOYEE",
    "department": "Engineering",
    "designation": "Software Engineer"
  }
}
```

**Status:** Backend must add this endpoint

---

### 4. Forgot Password ⭐ NEW ENDPOINT REQUIRED
**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@company.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent",
  "timestamp": "2026-04-08T12:00:00",
  "data": null
}
```

**Status:** Backend must add this endpoint

---

### 5. Reset Password ⭐ NEW ENDPOINT REQUIRED
**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "newPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful",
  "timestamp": "2026-04-08T12:00:00",
  "data": null
}
```

**Status:** Backend must add this endpoint

---

## Employee Profile

### 1. Get Employee Profile ⭐ UPDATED STRUCTURE REQUIRED
**Endpoint:** `GET /employees/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "id": 42,
    "name": "John Doe",
    "email": "john@company.com",
    "companyId": "ENS-1042",
    "role": "ROLE_EMPLOYEE",
    
    "jobDetails": {
      "dateOfJoining": "2024-10-12",
      "manager": "Alex Johnson",
      "managerId": 5,
      "designation": "Software Engineer",
      "department": "Engineering",
      "employmentType": "FULL_TIME",
      "office": "Headquarters (HQ)",
      "location": "San Francisco, CA",
      "businessUnit": "Engineering",
      "experience": "4 Years"
    },
    
    "personalDetails": {
      "dateOfBirth": "1995-05-24",
      "phoneNumber": "9876543210",
      "emergencyContact": "Jane Doe (+1 555-987-6543)",
      "address": {
        "addressLine1": "123 Tech Lane",
        "addressLine2": "Apt 4B",
        "city": "San Francisco",
        "state": "California",
        "pincode": "94105",
        "country": "USA"
      }
    },
    
    "financialDetails": {
      "id": 1,
      "maskedBankAccountNumber": "XXXXXXXX9012",
      "ifscCode": "CHAS0001234",
      "bankName": "Chase Bank",
      "maskedPanNumber": "ABCDE****F",
      "active": true
    }
  }
}
```

**Status:** Backend must update response structure to group fields by section

---

### 2. Update Employee Profile
**Endpoint:** `PUT /employees/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "phoneNumber": "9876543210",
  "dateOfBirth": "1995-05-24",
  "address": {
    "addressLine1": "123 Tech Lane",
    "addressLine2": "Apt 4B",
    "city": "San Francisco",
    "state": "California",
    "pincode": "94105",
    "country": "USA"
  }
}
```

**Note:** Cannot update email, password, or role via this endpoint

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "timestamp": "2026-04-08T12:00:00",
  "data": { /* Updated employee object */ }
}
```

---

### 3. Get Financial Details
**Endpoint:** `GET /employees/me/financial`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Financial details retrieved",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "id": 1,
    "employeeId": 42,
    "employeeName": "John Doe",
    "maskedBankAccountNumber": "XXXXXXXX9012",
    "ifscCode": "CHAS0001234",
    "bankName": "Chase Bank",
    "maskedPanNumber": "ABCDE****F",
    "createdAt": "2025-07-01T10:00:00",
    "updatedAt": "2025-07-01T10:00:00"
  }
}
```

---

### 4. Create/Update Financial Details
**Endpoint:** `POST /employees/me/financial`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "bankAccountNumber": "123456789012",
  "ifscCode": "SBIN0001234",
  "bankName": "State Bank of India",
  "panNumber": "ABCDE1234F"
}
```

**Validation:**
- Bank account: 9-18 digits
- IFSC: 4 letters + 0 + 6 alphanumeric chars
- PAN: 5 letters + 4 digits + 1 letter

**Response:**
```json
{
  "success": true,
  "message": "Financial details saved",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "id": 2,
    "employeeId": 42,
    "employeeName": "John Doe",
    "maskedBankAccountNumber": "XXXXXXXX9012",
    "ifscCode": "SBIN0001234",
    "bankName": "State Bank of India",
    "maskedPanNumber": "ABCDE****F",
    "createdAt": "2026-04-08T12:00:00",
    "updatedAt": "2026-04-08T12:00:00"
  }
}
```

---

## Attendance Management

### 1. Check In
**Endpoint:** `POST /attendance/check-in`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "date": "2026-04-08"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "timestamp": "2026-04-08T09:00:00",
  "data": {
    "id": 55,
    "employeeId": 3,
    "employeeName": "Jane Smith",
    "date": "2026-04-08",
    "checkIn": "09:02:34",
    "checkOut": null
  }
}
```

---

### 2. Check Out
**Endpoint:** `POST /attendance/check-out`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Checked out successfully",
  "timestamp": "2026-04-08T18:00:00",
  "data": {
    "id": 55,
    "employeeId": 3,
    "employeeName": "Jane Smith",
    "date": "2026-04-08",
    "checkIn": "09:02:34",
    "checkOut": "18:00:00"
  }
}
```

---

### 3. Get Own Attendance History
**Endpoint:** `GET /attendance/my`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: Page number (zero-indexed, default: 0)
- `size`: Records per page (default: 10)
- `sort`: Field to sort by (default: date)

**Response (Spring Page Format):**
```json
{
  "success": true,
  "message": "Attendance records retrieved",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "content": [
      {
        "id": 55,
        "employeeId": 3,
        "employeeName": "Jane Smith",
        "date": "2026-04-08",
        "checkIn": "09:02:34",
        "checkOut": "18:00:00"
      },
      {
        "id": 54,
        "employeeId": 3,
        "employeeName": "Jane Smith",
        "date": "2026-04-07",
        "checkIn": "09:15:00",
        "checkOut": "18:30:00"
      }
    ],
    "totalElements": 22,
    "totalPages": 3,
    "number": 0,
    "size": 10,
    "first": true,
    "last": false
  }
}
```

**Frontend Transformation:**
```javascript
// Transform Spring Page to frontend format
const transformPagination = (page) => ({
  currentPage: page.number + 1, // Convert 0-indexed to 1-indexed
  totalPages: page.totalPages,
  totalRecords: page.totalElements,
  recordsPerPage: page.size
})
```

---

### 4. Get Current Check-in Status ⭐ NEW ENDPOINT REQUIRED
**Endpoint:** `GET /attendance/status`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Status retrieved",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "isCheckedIn": true,
    "checkInTime": "09:02:34",
    "date": "2026-04-08"
  }
}
```

**Status:** Backend must add this endpoint

---

## Leave & WFH Management

### 1. Get Leave & WFH Balances ⭐ NEW ENDPOINT REQUIRED
**Endpoint:** `GET /leaves/balances`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Balances retrieved",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "leaveBalance": 12,
    "wfhBalance": 8
  }
}
```

**Status:** Backend must add this endpoint

---

### 2. Apply for Leave
**Endpoint:** `POST /leaves`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "startDate": "2026-04-15",
  "endDate": "2026-04-16",
  "reason": "Annual vacation"
}
```

**Validation:**
- `startDate`: Required, today or future
- `endDate`: Required, must be >= startDate
- `reason`: Optional

**Response:**
```json
{
  "success": true,
  "message": "Leave request submitted",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "id": 10,
    "employeeId": 3,
    "employeeName": "Jane Smith",
    "startDate": "2026-04-15",
    "endDate": "2026-04-16",
    "reason": "Annual vacation",
    "status": "PENDING"
  }
}
```

---

### 3. Get Own Leave History
**Endpoint:** `GET /leaves/my`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: Page number (zero-indexed, default: 0)
- `size`: Records per page (default: 10)
- `sort`: Field to sort by (default: startDate)

**Response (Spring Page Format):**
```json
{
  "success": true,
  "message": "Leave history retrieved",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "content": [
      {
        "id": 10,
        "employeeId": 3,
        "employeeName": "Jane Smith",
        "startDate": "2026-04-15",
        "endDate": "2026-04-16",
        "reason": "Annual vacation",
        "status": "PENDING"
      },
      {
        "id": 9,
        "employeeId": 3,
        "employeeName": "Jane Smith",
        "startDate": "2026-04-01",
        "endDate": "2026-04-02",
        "reason": "Sick leave",
        "status": "APPROVED"
      }
    ],
    "totalElements": 15,
    "totalPages": 2,
    "number": 0,
    "size": 10,
    "first": true,
    "last": false
  }
}
```

---

### 4. Cancel Leave Request
**Endpoint:** `DELETE /leaves/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Note:** Can only cancel PENDING requests

**Response:**
```json
{
  "success": true,
  "message": "Leave request cancelled",
  "timestamp": "2026-04-08T12:00:00",
  "data": null
}
```

---

### 5. Apply for WFH
**Endpoint:** `POST /remote-work`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "startDate": "2026-04-10",
  "endDate": "2026-04-10",
  "reason": "Internet outage at office"
}
```

**Validation:**
- `startDate`: Required, today or future
- `endDate`: Required, must be >= startDate
- `reason`: Optional, max 500 characters

**Response:**
```json
{
  "success": true,
  "message": "WFH request submitted",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "id": 7,
    "employeeId": 3,
    "employeeName": "Jane Smith",
    "startDate": "2026-04-10",
    "endDate": "2026-04-10",
    "reason": "Internet outage at office",
    "status": "PENDING",
    "reviewedBy": null,
    "reviewedAt": null,
    "createdAt": "2026-04-08T14:30:00"
  }
}
```

---

### 6. Get Own WFH History
**Endpoint:** `GET /remote-work/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: Page number (zero-indexed, default: 0)
- `size`: Records per page (default: 10)

**Response (Spring Page Format):**
```json
{
  "success": true,
  "message": "WFH history retrieved",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "content": [
      {
        "id": 7,
        "employeeId": 3,
        "employeeName": "Jane Smith",
        "startDate": "2026-04-10",
        "endDate": "2026-04-10",
        "reason": "Internet outage at office",
        "status": "PENDING",
        "reviewedBy": null,
        "reviewedAt": null,
        "createdAt": "2026-04-08T14:30:00"
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "number": 0,
    "size": 10,
    "first": true,
    "last": true
  }
}
```

---

## Dashboard

### 1. Get Dashboard Data ⭐ NEW ENDPOINT REQUIRED
**Endpoint:** `GET /dashboard`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "user": {
      "employeeId": 42,
      "username": "John Doe",
      "email": "john@company.com"
    },
    "teamAvailability": [
      {
        "employeeId": 3,
        "name": "Jane Smith",
        "status": "ON_LEAVE"
      },
      {
        "employeeId": 7,
        "name": "Bob Jones",
        "status": "REMOTE"
      }
    ],
    "todos": [
      {
        "id": 1,
        "title": "Complete project documentation",
        "description": "Update API docs",
        "isAsap": true,
        "completed": false,
        "createdAt": "2026-04-08T09:00:00"
      }
    ]
  }
}
```

**Status:** Backend must add this endpoint

**Frontend Transformation for Team Availability:**
```javascript
// Transform backend team availability to frontend format
const transformTeamAvailability = (backendData, date) => {
  const leave = backendData.filter(e => e.status === 'ON_LEAVE').map(e => e.name)
  const wfh = backendData.filter(e => e.status === 'REMOTE').map(e => e.name)
  
  return {
    id: 1,
    date: date,
    leave: leave.length > 0 ? leave.join(', ') : '-',
    wfh: wfh.length > 0 ? wfh.join(', ') : '-'
  }
}
```

---

### 2. Get Team Availability
**Endpoint:** `GET /employees/team/availability`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `managerId`: Required for ADMIN/HR, ignored for EMPLOYEE (derived from JWT)
- `date`: Optional, defaults to today (format: yyyy-MM-dd)

**Response:**
```json
{
  "success": true,
  "message": "Team availability retrieved",
  "timestamp": "2026-04-08T12:00:00",
  "data": [
    {
      "employeeId": 3,
      "name": "Jane Smith",
      "status": "ON_LEAVE"
    },
    {
      "employeeId": 7,
      "name": "Bob Jones",
      "status": "REMOTE"
    }
  ]
}
```

**Note:** If employee has both approved leave and WFH on same day, ON_LEAVE takes priority

---

### 3. Add Todo ⭐ NEW ENDPOINT REQUIRED
**Endpoint:** `POST /dashboard/todos`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "isAsap": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Todo added successfully",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "id": 2,
    "title": "Task title",
    "description": "Task description",
    "isAsap": false,
    "completed": false,
    "createdAt": "2026-04-08T10:00:00"
  }
}
```

**Status:** Backend must add this endpoint

---

### 4. Update Todo ⭐ NEW ENDPOINT REQUIRED
**Endpoint:** `PUT /dashboard/todos/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "isAsap": true,
  "completed": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Todo updated successfully",
  "timestamp": "2026-04-08T12:00:00",
  "data": { /* Updated todo object */ }
}
```

**Status:** Backend must add this endpoint

---

### 5. Delete Todo ⭐ NEW ENDPOINT REQUIRED
**Endpoint:** `DELETE /dashboard/todos/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Todo deleted successfully",
  "timestamp": "2026-04-08T12:00:00",
  "data": null
}
```

**Status:** Backend must add this endpoint

---

## Data Entities

### Employee Entity
```json
{
  "id": "Long",
  "name": "String",
  "email": "String",
  "companyId": "String",
  "role": "ROLE_ADMIN | ROLE_HR | ROLE_EMPLOYEE",
  "department": "String",
  "phoneNumber": "String (10-digit Indian mobile)",
  "dateOfBirth": "LocalDate (YYYY-MM-DD)",
  "manager": {
    "id": "Long",
    "name": "String",
    "email": "String",
    "designation": "String",
    "department": "String"
  },
  "managerId": "Long",
  "designation": "String",
  "employmentType": "FULL_TIME | CONTRACT | INTERN",
  "dateOfJoining": "LocalDate (YYYY-MM-DD)",
  "address": {
    "addressLine1": "String",
    "addressLine2": "String",
    "city": "String",
    "state": "String",
    "pincode": "String (6-digit Indian PIN)",
    "country": "String"
  },
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

### Attendance Entity
```json
{
  "id": "Long",
  "employeeId": "Long",
  "employeeName": "String",
  "date": "LocalDate (YYYY-MM-DD)",
  "checkIn": "LocalTime (HH:mm:ss)",
  "checkOut": "LocalTime (HH:mm:ss)"
}
```

### Leave Entity
```json
{
  "id": "Long",
  "employeeId": "Long",
  "employeeName": "String",
  "startDate": "LocalDate (YYYY-MM-DD)",
  "endDate": "LocalDate (YYYY-MM-DD)",
  "reason": "String",
  "status": "PENDING | APPROVED | REJECTED"
}
```

### RemoteWorkRequest Entity
```json
{
  "id": "Long",
  "employeeId": "Long",
  "employeeName": "String",
  "startDate": "LocalDate (YYYY-MM-DD)",
  "endDate": "LocalDate (YYYY-MM-DD)",
  "reason": "String",
  "status": "PENDING | APPROVED | REJECTED",
  "reviewedBy": "Long",
  "reviewedAt": "LocalDateTime",
  "createdAt": "LocalDateTime"
}
```

### FinancialDetails Entity
```json
{
  "id": "Long",
  "employeeId": "Long",
  "employeeName": "String",
  "maskedBankAccountNumber": "String (XXXXXXXX9012)",
  "ifscCode": "String (4 letters + 0 + 6 alphanumeric)",
  "bankName": "String",
  "maskedPanNumber": "String (ABCDE****F)",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

### Todo Entity ⭐ NEW ENTITY REQUIRED
```json
{
  "id": "Long",
  "employeeId": "Long",
  "title": "String",
  "description": "String",
  "isAsap": "Boolean",
  "completed": "Boolean",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

### Team Availability Response
```json
[
  {
    "employeeId": "Long",
    "name": "String",
    "status": "ON_LEAVE | REMOTE"
  }
]
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2026-04-08T12:00:00",
  "data": { /* Optional error details */ }
}
```

### Common HTTP Status Codes
- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation errors, invalid input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Backend Error Response Examples

**400 Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "email": "Invalid email format"
  }
}
```

**401 Unauthorized (Invalid Credentials):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "timestamp": "2026-04-08T12:00:00",
  "data": null
}
```

**401 Unauthorized (Token Expired):**
```json
{
  "success": false,
  "message": "JWT token is expired",
  "timestamp": "2026-04-08T12:00:00",
  "data": null
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied: insufficient privileges",
  "timestamp": "2026-04-08T12:00:00",
  "data": null
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Employee not found with id: 99",
  "timestamp": "2026-04-08T12:00:00",
  "data": null
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Something went wrong",
  "timestamp": "2026-04-08T12:00:00",
  "data": null
}
```

---

## Authentication Flow

### Frontend Authentication Implementation

1. **Login Flow:**
   - User submits email and password
   - Frontend sends POST to `/auth/login`
   - Backend validates credentials and returns JWT token in response envelope
   - Frontend stores token in localStorage:
     ```javascript
     const response = await axios.post('/auth/login', { email, password })
     // Backend returns: { success, message, timestamp, data: { token, type, employeeId, email, role } }
     const authData = {
       employeeId: response.data.data.employeeId,
       username: response.data.data.email, // Use email as username
       email: response.data.data.email,
       role: response.data.data.role.replace('ROLE_', ''), // Strip prefix
       token: response.data.data.token
     }
     localStorage.setItem('auth', JSON.stringify(authData))
     ```
   - Redirect user to dashboard

2. **Token Usage:**
   - All protected API calls include header:
     ```
     Authorization: Bearer {token}
     ```
   - Axios interceptor automatically attaches token

3. **Token Expiry:**
   - Token valid for 24 hours
   - On 401 response, frontend clears localStorage and redirects to login
   - No refresh token mechanism currently (force re-login on expiry)

4. **User Context:**
   - AuthContext provides global auth state
   - On app load, calls `/auth/me` to refresh user data
   - Context structure: `{ auth: { employeeId, username, email, role, token }, setAuth }`

### Axios Configuration

```javascript
// src/config/axiosConfig.js
import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach token automatically
instance.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('auth'))
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// Handle 401 globally and extract data from envelope
instance.interceptors.response.use(
  (response) => response.data.data, // Extract data from backend envelope
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default instance
```

### Special Case: Login Endpoint

Login endpoint requires special handling since we need the token directly:

```javascript
// src/api/auth.api.js
import axios from '../config/axiosConfig'

export const loginUser = async (data) => {
  const response = await axios.post('/auth/login', data)
  // Don't use interceptor, access full response
  return response.data.data // Returns { token, type, employeeId, email, role }
}
```

---

## Additional Notes

### Date Formats
- Dates (LocalDate): ISO-8601 → `2025-07-15` (yyyy-MM-DD)
- Times (LocalTime): ISO-8601 → `09:02:34` (HH:mm:ss)
- Timestamps (LocalDateTime): ISO-8601 → `2025-07-15T09:00:00`

### Pagination
- All paginated endpoints use Spring Page format
- Query params: `?page=0&size=10&sort=name` (page is zero-indexed)
- Spring Page response: `{ content, totalElements, totalPages, number, size, first, last }`
- Frontend must transform to 1-indexed pagination

### Validation Rules
- Phone number: Indian mobile, 10 digits (e.g. 9876543210)
- PIN code: 6-digit Indian PIN (e.g. 560001)
- IFSC code: 4 uppercase letters + '0' + 6 alphanumeric chars (e.g. SBIN0001234)
- PAN: 5 uppercase letters + 4 digits + 1 uppercase letter (e.g. ABCDE1234F)
- Bank account: 9-18 digits
- Password: minimum 6 characters
- Leave startDate: must be today or future
- Remote work startDate: must be today or future
- dateOfBirth: must be in the past
- dateOfJoining: must be past or present

### Role Handling
- Backend sends roles with prefix: `ROLE_ADMIN`, `ROLE_EMPLOYEE`, `ROLE_HR`
- Frontend should strip `ROLE_` prefix for display/logic
- Requests use role without prefix: `ADMIN`, `EMPLOYEE`, `HR`

---

## Summary of Required Changes

### Backend Must Add (8 New Endpoints)

**High Priority:**
1. ✅ `GET /api/auth/me` - Get current user profile
2. ✅ `GET /api/employees/me` - Get detailed profile with job/personal/financial sections
3. ✅ `GET /api/attendance/status` - Get current check-in status
4. ✅ `GET /api/leaves/balances` - Get leave and WFH balances
5. ✅ `GET /api/dashboard` - Get aggregated dashboard data

**Medium Priority:**
6. ✅ `POST /api/auth/forgot-password` - Initiate password reset
7. ✅ `POST /api/auth/reset-password` - Complete password reset
8. ✅ Todo CRUD endpoints - `POST/PUT/DELETE /api/dashboard/todos`

### Backend Must Update

1. ✅ Update `GET /api/employees/me` response to group fields by section (jobDetails, personalDetails, financialDetails)
2. ✅ Add `leaveBalance` and `wfhBalance` fields to Employee entity
3. ✅ Add `companyId` field to Employee entity
4. ✅ Add Todo entity to database

### Frontend Must Update

1. ✅ Update axios interceptor to extract `data.data` from backend envelope
2. ✅ Update login handling to access token from `response.data.data`
3. ✅ Strip `ROLE_` prefix from roles
4. ✅ Update endpoint names to use `/my` suffixes:
   - `/attendance/my` for own attendance
   - `/leaves/my` for own leaves
   - `/remote-work/me` for own WFH requests
5. ✅ Update pagination to handle Spring Page format (zero-indexed to one-indexed)
6. ✅ Add separate API call for financial details
7. ✅ Transform team availability response to frontend format
8. ✅ Update Profile component to handle new sectioned structure
9. ✅ Update Attendance component to use status endpoint
10. ✅ Update TimeOff component to use balances endpoint

---

## Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user with all required fields
- [ ] Register with duplicate email
- [ ] Get current user via `/auth/me`
- [ ] Forgot password flow (when backend adds endpoint)
- [ ] Reset password flow (when backend adds endpoint)

### Profile
- [ ] Get employee profile with sectioned structure
- [ ] Update personal details
- [ ] Get financial details (masked)
- [ ] Create/update financial details
- [ ] Verify masked data (bank account, PAN)

### Attendance
- [ ] Check in with date parameter
- [ ] Check out
- [ ] Get own attendance history with `/my` endpoint
- [ ] Get current check-in status
- [ ] Test pagination with Spring Page format

### Leave/WFH
- [ ] Get balances via new endpoint
- [ ] Apply for leave with validation
- [ ] Apply for WFH with validation
- [ ] Get own leave history with `/my` endpoint
- [ ] Get own WFH history with `/me` endpoint
- [ ] Cancel pending leave request
- [ ] Test balance validation

### Dashboard
- [ ] Get dashboard data with team availability and todos
- [ ] Get team availability for specific date
- [ ] Transform team availability to frontend format
- [ ] Add todo (when backend adds endpoint)
- [ ] Update todo (when backend adds endpoint)
- [ ] Delete todo (when backend adds endpoint)

---

**Document maintained by:** Frontend Team  
**For questions, contact:** Frontend Development Team  
**Backend Implementation Plan:** See `BACKEND_IMPLEMENTATION_PLAN.md`

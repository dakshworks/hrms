# Backend Implementation Plan for Frontend Integration

**Status:** Required Changes  
**Priority:** High  
**Date:** April 8, 2026

---

## Executive Summary

This document outlines the changes required in the backend Spring Boot API to fully support the React HRMS frontend. Some changes require adding new endpoints, while others require updating existing endpoints to match frontend expectations.

---

## Part 1: New Endpoints Required (Backend Must Add)

### 1.1 Get Current User Profile
**Priority:** HIGH  
**Controller:** `AuthController`

**Endpoint:** `GET /api/auth/me`  
**Auth Required:** Yes  
**Roles:** All authenticated users

**Purpose:** Frontend needs to fetch current user details on app load to populate AuthContext

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

**Implementation:**
```java
@GetMapping("/me")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<ApiResponse<EmployeeResponse>> getCurrentUser(
    @AuthenticationPrincipal EmployeeUserDetails userDetails
) {
    Employee employee = employeeService.findById(userDetails.getEmployeeId());
    EmployeeResponse response = employeeMapper.toResponse(employee);
    return ResponseEntity.ok(ApiResponse.success(response, "User profile retrieved"));
}
```

---

### 1.2 Forgot Password
**Priority:** MEDIUM  
**Controller:** `AuthController`

**Endpoint:** `POST /api/auth/forgot-password`  
**Auth Required:** No

**Purpose:** Initiate password reset flow

**Request Body:**
```json
{
  "email": "john@company.com"
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

**Implementation Notes:**
- Generate a reset token
- Store token with expiry (e.g., 1 hour)
- Send email with reset link (email service integration needed)
- For now, can return token in response for development testing

---

### 1.3 Reset Password
**Priority:** MEDIUM  
**Controller:** `AuthController`

**Endpoint:** `POST /api/auth/reset-password`  
**Auth Required:** No

**Purpose:** Complete password reset with token

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

**Implementation Notes:**
- Validate token and expiry
- Update employee password
- Invalidate reset token

---

### 1.4 Leave & WFH Balances
**Priority:** HIGH  
**Controller:** `LeaveController`

**Endpoint:** `GET /api/leaves/balances`  
**Auth Required:** Yes  
**Roles:** All authenticated users

**Purpose:** Frontend needs to display remaining leave and WFH balance

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

**Implementation:**
```java
@GetMapping("/balances")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<ApiResponse<BalanceResponse>> getBalances(
    @AuthenticationPrincipal EmployeeUserDetails userDetails
) {
    Long employeeId = userDetails.getEmployeeId();
    int leaveBalance = leaveService.getLeaveBalance(employeeId);
    int wfhBalance = remoteWorkService.getWfhBalance(employeeId);
    BalanceResponse response = new BalanceResponse(leaveBalance, wfhBalance);
    return ResponseEntity.ok(ApiResponse.success(response, "Balances retrieved"));
}
```

**Entity Changes Needed:**
- Add `leaveBalance` and `wfhBalance` fields to Employee entity
- Or create a separate `EmployeeBalance` entity
- Update balances when leave/WFH requests are approved

---

### 1.5 Current Check-in Status
**Priority:** HIGH  
**Controller:** `AttendanceController`

**Endpoint:** `GET /api/attendance/status`  
**Auth Required:** Yes  
**Roles:** All authenticated users

**Purpose:** Frontend needs to know if user is currently checked in

**Response:**
```json
{
  "success": true,
  "message": "Status retrieved",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "isCheckedIn": true,
    "checkInTime": "09:00:00",
    "date": "2026-04-08"
  }
}
```

**Implementation:**
```java
@GetMapping("/status")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<ApiResponse<CheckInStatusResponse>> getCheckInStatus(
    @AuthenticationPrincipal EmployeeUserDetails userDetails
) {
    Long employeeId = userDetails.getEmployeeId();
    Attendance attendance = attendanceService.findTodayAttendance(employeeId);
    CheckInStatusResponse response = attendanceService.buildStatusResponse(attendance);
    return ResponseEntity.ok(ApiResponse.success(response, "Status retrieved"));
}
```

---

### 1.6 Dashboard Data
**Priority:** HIGH  
**Controller:** `DashboardController` (NEW)

**Endpoint:** `GET /api/dashboard`  
**Auth Required:** Yes  
**Roles:** All authenticated users

**Purpose:** Frontend needs aggregated dashboard data

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

**Implementation:**
```java
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
        @AuthenticationPrincipal EmployeeUserDetails userDetails
    ) {
        Long employeeId = userDetails.getEmployeeId();
        
        // Get user info
        Employee employee = employeeService.findById(employeeId);
        
        // Get team availability (reuse existing endpoint logic)
        List<TeamAvailabilityDTO> teamAvailability = 
            teamAvailabilityService.getTeamAvailability(employee.getManagerId(), LocalDate.now());
        
        // Get todos
        List<TodoDTO> todos = todoService.findByEmployeeId(employeeId);
        
        DashboardResponse response = new DashboardResponse(
            employeeMapper.toSimpleResponse(employee),
            teamAvailability,
            todos
        );
        
        return ResponseEntity.ok(ApiResponse.success(response, "Dashboard data retrieved"));
    }
}
```

---

### 1.7 Todo CRUD Endpoints
**Priority:** MEDIUM  
**Controller:** `TodoController` (NEW)

**Endpoint:** `POST /api/dashboard/todos`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "isAsap": false
}
```

**Endpoint:** `PUT /api/dashboard/todos/{id}`  
**Auth Required:** Yes

**Endpoint:** `DELETE /api/dashboard/todos/{id}`  
**Auth Required:** Yes

**Entity Needed:**
```java
@Entity
@Table(name = "todos")
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    private String description;
    
    private Boolean isAsap = false;
    
    private Boolean completed = false;
    
    @Column(nullable = false)
    private Long employeeId;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

---

### 1.8 Employee Profile with Detailed Sections
**Priority:** HIGH  
**Controller:** `EmployeeController`

**Endpoint:** `GET /api/employees/me`  
**Auth Required:** Yes  
**Roles:** All authenticated users

**Purpose:** Frontend needs profile with job, personal, and financial details split

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "timestamp": "2026-04-08T12:00:00",
  "data": {
    "id": 42,
    "username": "John Doe",
    "email": "john@company.com",
    "companyId": "ENS-1042",
    "role": "ROLE_EMPLOYEE",
    
    // Job Details
    "jobDetails": {
      "dateOfJoining": "2024-10-12",
      "manager": "Alex Johnson",
      "managerId": 5,
      "project": "HRMS Platform Redesign",
      "office": "Headquarters (HQ)",
      "location": "San Francisco, CA",
      "businessUnit": "Engineering",
      "experience": "4 Years",
      "designation": "Software Engineer",
      "department": "Engineering"
    },
    
    // Personal Details
    "personalDetails": {
      "dateOfBirth": "1995-05-24",
      "phoneNumber": "+1 (555) 123-4567",
      "emergencyContact": "Jane Doe (+1 555-987-6543)",
      "personalEmail": "johndoe.personal@email.com",
      "address": "123 Tech Lane, Apt 4B, San Francisco, CA 94105"
    },
    
    // Financial Details
    "financialDetails": {
      "id": 1,
      "accountNo": "XXXXXXXX9012",
      "bankName": "Chase Bank",
      "ifsc": "CHAS0001234",
      "active": true
    }
  }
}
```

**Implementation Notes:**
- Create a comprehensive DTO that groups fields by section
- Reuse existing `/financial` endpoint logic
- Add `companyId` field to Employee entity (or generate from ID)

---

## Part 2: Frontend Changes Required (Adapt to Backend)

### 2.1 Update Response Envelope Handling

**Current Frontend Expectation:**
```json
{ "token": "...", "data": { ... } }
```

**Backend Actual Response:**
```json
{ "success": true, "message": "...", "timestamp": "...", "data": { ... } }
```

**Fix:** Update axios interceptor and all API calls to handle backend envelope:

```javascript
// In axiosConfig.js
instance.interceptors.response.use(
  (res) => res.data.data, // Extract data from backend envelope
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
```

**Special Case for Login:** Login endpoint returns token directly in data, need to handle separately:

```javascript
// In auth.api.js
export const loginUser = async (data) => {
  const response = await axios.post('/auth/login', data)
  // Backend returns: { success, message, timestamp, data: { token, type, employeeId, email, role } }
  return response.data.data // Returns { token, type, employeeId, email, role }
}
```

---

### 2.2 Update Endpoint Names for Self-Access

**Change:**
- `/attendance` → `/attendance/my` (for own attendance)
- `/leaves` → `/leaves/my` (for own leaves)
- `/remote-work` → `/remote-work/me` (for own WFH requests)

**Files to Update:**
- `src/api/attendance.api.js`
- `src/api/leave.api.js`
- `src/api/remote-work.api.js`

---

### 2.3 Update Pagination Handling

**Backend Response (Spring Page):**
```json
{
  "content": [ ... ],
  "totalElements": 150,
  "totalPages": 15,
  "number": 0,
  "size": 10,
  "first": true,
  "last": false
}
```

**Frontend Current Expectation:**
```json
{
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalRecords": 22,
    "recordsPerPage": 10
  }
}
```

**Fix:** Update pagination components to handle Spring Page format:

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

### 2.4 Update Financial Details Handling

**Backend:** Separate endpoint with masked data  
**Frontend:** Expected banks array in profile response

**Fix:**
1. Add separate API call for financial details
2. Update Profile component to fetch financial details separately

```javascript
// In profile.api.js
export const getFinancialDetails = async () => {
  const response = await axios.get('/employees/me/financial')
  return response.data
}
```

---

### 2.5 Update Team Availability Handling

**Backend Response:**
```json
[
  { "employeeId": 3, "name": "Jane Smith", "status": "ON_LEAVE" },
  { "employeeId": 7, "name": "Bob Jones", "status": "REMOTE" }
]
```

**Frontend Current Expectation:**
```json
[
  {
    "id": 1,
    "date": "2026-04-07",
    "leave": ["Alice", "John"],
    "wfh": ["Bob"]
  }
]
```

**Fix:** Update Dashboard component to transform backend response to frontend format:

```javascript
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

### 2.6 Update Role Handling

**Backend:** Returns `ROLE_ADMIN`, `ROLE_EMPLOYEE`  
**Frontend:** Expects `ADMIN`, `EMPLOYEE`

**Fix:** Strip `ROLE_` prefix when storing in AuthContext:

```javascript
// In AuthContext.jsx
const role = response.data.role.replace('ROLE_', '')
setAuth(prev => ({ ...prev, role }))
```

---

## Part 3: Implementation Priority Order

### Phase 1: Critical (Do First)
1. ✅ Add `GET /api/auth/me` endpoint
2. ✅ Add `GET /api/employees/me` endpoint with detailed profile
3. ✅ Add `GET /api/attendance/status` endpoint
4. ✅ Add `GET /api/leaves/balances` endpoint
5. ✅ Update frontend axios interceptor for response envelope
6. ✅ Update frontend endpoint names to use `/my` suffixes

### Phase 2: High Priority
7. ✅ Add `GET /api/dashboard` endpoint
8. ✅ Add Todo entity and CRUD endpoints
9. ✅ Update frontend pagination handling
10. ✅ Update frontend financial details handling
11. ✅ Update frontend team availability transformation

### Phase 3: Medium Priority
12. ✅ Add forgot password endpoint
13. ✅ Add reset password endpoint
14. ✅ Update frontend role handling

---

## Part 4: Database Schema Changes

### New Tables Needed

```sql
-- Todos table
CREATE TABLE todos (
    id BIGINT PRIMARY KEY IDENTITY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_asap BIT DEFAULT 0,
    completed BIT DEFAULT 0,
    employee_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id BIGINT PRIMARY KEY IDENTITY,
    employee_id BIGINT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    used BIT DEFAULT 0,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

### Employee Table Changes

```sql
-- Add balance fields to employees table
ALTER TABLE employees
ADD leave_balance INT DEFAULT 12;
ALTER TABLE employees
ADD wfh_balance INT DEFAULT 8;
ALTER TABLE employees
ADD company_id VARCHAR(50);
```

---

## Part 5: Testing Checklist

### Backend Testing
- [ ] Test `GET /api/auth/me` returns current user
- [ ] Test `GET /api/employees/me` returns detailed profile
- [ ] Test `GET /api/attendance/status` returns check-in status
- [ ] Test `GET /api/leaves/balances` returns correct balances
- [ ] Test `GET /api/dashboard` returns aggregated data
- [ ] Test Todo CRUD operations
- [ ] Test forgot password flow
- [ ] Test reset password flow
- [ ] Test balance updates on leave/WFH approval

### Frontend Testing
- [ ] Test login with updated response handling
- [ ] Test AuthContext population with `/auth/me`
- [ ] Test profile display with all sections
- [ ] Test attendance check-in/out with status endpoint
- [ ] Test leave application with balance validation
- [ ] Test dashboard with team availability and todos
- [ ] Test pagination with Spring Page format
- [ ] Test financial details display

---

## Part 6: Configuration Changes

### application.properties Updates

```properties
# Email configuration (for password reset)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Or disable email for development (return token in response)
app.email.enabled=false
```

---

## Summary

**Backend Must Add:**
- 8 new endpoints (auth/me, forgot/reset password, balances, status, dashboard, todos)
- 2 new database tables (todos, password_reset_tokens)
- 3 new fields to employees table (leave_balance, wfh_balance, company_id)

**Frontend Must Change:**
- Update axios interceptor for response envelope
- Update endpoint names to use `/my` suffixes
- Update pagination handling for Spring Page
- Add separate API call for financial details
- Transform team availability response
- Strip `ROLE_` prefix from roles

**Estimated Effort:**
- Backend: 8-12 hours
- Frontend: 4-6 hours
- Testing: 4-6 hours

**Total:** 16-24 hours for complete integration

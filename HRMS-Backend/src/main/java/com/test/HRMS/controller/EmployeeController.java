package com.test.HRMS.controller;

import com.test.HRMS.dto.request.ChangePasswordRequest;
import com.test.HRMS.dto.request.EmployeeFinancialRequest;
import com.test.HRMS.dto.request.EmployeeRequest;
import com.test.HRMS.dto.request.EmployeeUpdateRequest;
import com.test.HRMS.dto.request.ResetPasswordRequest;
import com.test.HRMS.dto.response.ApiResponse;
import com.test.HRMS.dto.response.EmployeeFinancialDTO;
import com.test.HRMS.dto.response.EmployeeResponse;
import com.test.HRMS.security.EmployeeUserDetails;
import com.test.HRMS.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Employee management REST API.
 *
 * Role matrix:
 *  GET  (all / by-id / with-manager / team)  → ADMIN, HR
 *  POST (create)                             → ADMIN
 *  PUT  (update)                             → ADMIN, HR, self
 *  DELETE                                    → ADMIN
 *  POST/GET /financial                       → ADMIN, HR
 *  POST /me/change-password                  → Any authenticated user (own account)
 *  POST /{id}/reset-password                 → ADMIN
 */
@RestController
@RequestMapping("/api/employees")
@Slf4j
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // ── Core CRUD ─────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> getAllEmployees(
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getAllEmployees(pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getEmployeeById(id)));
    }

    @GetMapping("/{id}/with-manager")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeWithManager(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getEmployeeWithManager(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse created = employeeService.createEmployee(request);
        log.info("Admin created employee id: {}", created.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Employee created successfully"));
    }

    /** Self-update — any authenticated user can update their own profile. */
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateOwnProfile(
            @AuthenticationPrincipal EmployeeUserDetails principal,
            @Valid @RequestBody EmployeeUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                employeeService.updateEmployee(principal.getId(), request),
                "Profile updated successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                employeeService.updateEmployee(id, request), "Employee updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Employee deleted successfully"));
    }

    // ── Hierarchy ─────────────────────────────────────────────────────────────

    @GetMapping("/manager/{managerId}/team")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> getTeamByManager(
            @PathVariable Long managerId,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                employeeService.getTeamByManager(managerId, pageable)));
    }

    // ── Financial details ─────────────────────────────────────────────────────

    @PostMapping("/{id}/financial")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmployeeFinancialDTO>> upsertFinancialDetails(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeFinancialRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                employeeService.upsertFinancialDetails(id, request),
                "Financial details saved successfully"));
    }

    @GetMapping("/{id}/financial")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<EmployeeFinancialDTO>> getFinancialDetails(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getFinancialDetails(id)));
    }

    // ── Password management ───────────────────────────────────────────────────

    /**
     * POST /api/employees/me/change-password
     * Any authenticated employee can change their own password.
     * Requires the current password for verification.
     */
    @PostMapping("/me/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal EmployeeUserDetails principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        employeeService.changePassword(principal.getId(),
                request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    /**
     * POST /api/employees/{id}/reset-password
     * ADMIN only — resets another employee's password without needing the current password.
     */
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request) {
        employeeService.resetPassword(id, request.getNewPassword());
        log.info("Admin reset password for employee id: {}", id);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }
}

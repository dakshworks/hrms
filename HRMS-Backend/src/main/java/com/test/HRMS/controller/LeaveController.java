package com.test.HRMS.controller;

import com.test.HRMS.dto.request.LeaveRequest;
import com.test.HRMS.dto.request.LeaveStatusRequest;
import com.test.HRMS.dto.response.ApiResponse;
import com.test.HRMS.dto.response.LeaveResponse;
import com.test.HRMS.security.EmployeeUserDetails;
import com.test.HRMS.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<LeaveResponse>> applyLeave(
            @Valid @RequestBody LeaveRequest request,
            @AuthenticationPrincipal EmployeeUserDetails currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        leaveService.applyLeave(currentUser.getId(), request),
                        "Leave applied successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<LeaveResponse>> getLeave(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getLeaveById(id)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Page<LeaveResponse>>> getMyLeaves(
            @AuthenticationPrincipal EmployeeUserDetails currentUser,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                leaveService.getLeavesByEmployee(currentUser.getId(), pageable)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Page<LeaveResponse>>> getAllLeaves(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getAllLeaves(pageable)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Page<LeaveResponse>>> getPendingLeaves(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getPendingLeaves(pageable)));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Page<LeaveResponse>>> getLeavesByEmployee(
            @PathVariable Long employeeId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                leaveService.getLeavesByEmployee(employeeId, pageable)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<LeaveResponse>> updateLeaveStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeaveStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                leaveService.updateLeaveStatus(id, request), "Leave status updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Void>> cancelLeave(
            @PathVariable Long id,
            @AuthenticationPrincipal EmployeeUserDetails currentUser) {
        leaveService.cancelLeave(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Leave cancelled successfully"));
    }
}

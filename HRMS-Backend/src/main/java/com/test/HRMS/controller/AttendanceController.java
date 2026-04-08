package com.test.HRMS.controller;

import com.test.HRMS.dto.request.AttendanceRequest;
import com.test.HRMS.dto.response.ApiResponse;
import com.test.HRMS.dto.response.AttendanceResponse;
import com.test.HRMS.security.EmployeeUserDetails;
import com.test.HRMS.service.AttendanceService;
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
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(
            @Valid @RequestBody AttendanceRequest request,
            @AuthenticationPrincipal EmployeeUserDetails currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        attendanceService.checkIn(currentUser.getId(), request),
                        "Checked in successfully"));
    }

    @PostMapping("/check-out")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(
            @Valid @RequestBody AttendanceRequest request,
            @AuthenticationPrincipal EmployeeUserDetails currentUser) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.checkOut(currentUser.getId(), request),
                "Checked out successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> getAttendance(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getAttendanceById(id)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Page<AttendanceResponse>>> getMyAttendance(
            @AuthenticationPrincipal EmployeeUserDetails currentUser,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.getAttendanceByEmployee(currentUser.getId(), pageable)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Page<AttendanceResponse>>> getAllAttendance(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getAllAttendance(pageable)));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Page<AttendanceResponse>>> getEmployeeAttendance(
            @PathVariable Long employeeId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                attendanceService.getAttendanceByEmployee(employeeId, pageable)));
    }
}

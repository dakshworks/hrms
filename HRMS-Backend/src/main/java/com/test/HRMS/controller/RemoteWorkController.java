package com.test.HRMS.controller;

import com.test.HRMS.dto.request.RemoteWorkRequest;
import com.test.HRMS.dto.request.RemoteWorkStatusRequest;
import com.test.HRMS.dto.response.ApiResponse;
import com.test.HRMS.dto.response.RemoteWorkResponse;
import com.test.HRMS.security.EmployeeUserDetails;
import com.test.HRMS.service.RemoteWorkService;
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
@RequestMapping("/api/remote-work")
public class RemoteWorkController {

    private final RemoteWorkService remoteWorkService;

    public RemoteWorkController(RemoteWorkService remoteWorkService) {
        this.remoteWorkService = remoteWorkService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<RemoteWorkResponse>> applyRemoteWork(
            @AuthenticationPrincipal EmployeeUserDetails principal,
            @Valid @RequestBody RemoteWorkRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        remoteWorkService.applyRemoteWork(principal.getId(), request),
                        "Remote work request submitted successfully"));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<RemoteWorkResponse>>> getMyRequests(
            @AuthenticationPrincipal EmployeeUserDetails principal,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                remoteWorkService.getMyRequests(principal.getId(), pageable)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Page<RemoteWorkResponse>>> getAllRequests(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(remoteWorkService.getAllRequests(pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<RemoteWorkResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(remoteWorkService.getById(id)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<RemoteWorkResponse>> updateStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal EmployeeUserDetails principal,
            @Valid @RequestBody RemoteWorkStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                remoteWorkService.updateStatus(id, principal.getId(), request),
                "Remote work request status updated"));
    }
}

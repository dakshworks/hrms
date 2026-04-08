package com.test.HRMS.controller;

import com.test.HRMS.dto.request.ManagerProjectRequest;
import com.test.HRMS.dto.response.ApiResponse;
import com.test.HRMS.dto.response.ManagerProjectResponse;
import com.test.HRMS.service.ManagerProjectService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/manager-projects")
@Slf4j
public class ManagerProjectController {

    private final ManagerProjectService managerProjectService;

    public ManagerProjectController(ManagerProjectService managerProjectService) {
        this.managerProjectService = managerProjectService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ManagerProjectResponse>> assignProject(
            @Valid @RequestBody ManagerProjectRequest request) {
        ManagerProjectResponse response = managerProjectService.assignProject(request);
        log.info("Project '{}' assigned to manager {}", request.getProjectId(), request.getManagerId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Project assigned to manager successfully"));
    }

    /** Paginated list of projects for a given manager. */
    @GetMapping("/manager/{managerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Page<ManagerProjectResponse>>> getProjectsByManager(
            @PathVariable Long managerId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                managerProjectService.getProjectsByManager(managerId, pageable)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeMapping(@PathVariable Long id) {
        managerProjectService.removeMapping(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Manager–project mapping removed successfully"));
    }
}

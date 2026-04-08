package com.test.HRMS.controller;

import com.test.HRMS.dto.response.ApiResponse;
import com.test.HRMS.dto.response.TeamAvailabilityDTO;
import com.test.HRMS.entity.Employee;
import com.test.HRMS.repository.EmployeeRepository;
import com.test.HRMS.security.EmployeeUserDetails;
import com.test.HRMS.service.TeamAvailabilityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

/**
 * GET /api/employees/team/availability
 *
 * EMPLOYEE → team derived from their own managerId (no param needed)
 * ADMIN/HR → must supply ?managerId= query param
 *
 * Only unavailable members (ON_LEAVE or REMOTE) are returned.
 */
@RestController
@RequestMapping("/api/employees/team")
public class TeamAvailabilityController {

    private final TeamAvailabilityService teamAvailabilityService;
    private final EmployeeRepository      employeeRepository;

    public TeamAvailabilityController(TeamAvailabilityService teamAvailabilityService,
                                      EmployeeRepository employeeRepository) {
        this.teamAvailabilityService = teamAvailabilityService;
        this.employeeRepository      = employeeRepository;
    }

    @GetMapping("/availability")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<TeamAvailabilityDTO>>> getTeamAvailability(
            @AuthenticationPrincipal EmployeeUserDetails principal,
            @RequestParam(required = false) Long managerId,
            @RequestParam(required = false) String date) {

        LocalDate targetDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        Long resolvedManagerId = resolveManagerId(principal, managerId);

        List<TeamAvailabilityDTO> result =
                teamAvailabilityService.getUnavailableTeamMembers(resolvedManagerId, targetDate);

        return ResponseEntity.ok(ApiResponse.success(result,
                "Unavailable team members fetched successfully"));
    }

    private Long resolveManagerId(EmployeeUserDetails principal, Long paramManagerId) {
        boolean isAdminOrHr = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                            || a.getAuthority().equals("ROLE_HR"));

        if (isAdminOrHr) {
            if (paramManagerId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "ADMIN and HR must supply ?managerId= query parameter");
            }
            return paramManagerId;
        }

        // EMPLOYEE — derive manager from their own profile
        Employee self = employeeRepository.findById(principal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Employee not found with id: " + principal.getId()));

        if (self.getManager() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You are not assigned to any team (no manager found)");
        }

        return self.getManager().getId();
    }
}

package com.test.HRMS.service;

import com.test.HRMS.dto.request.EmployeeFinancialRequest;
import com.test.HRMS.dto.request.EmployeeRequest;
import com.test.HRMS.dto.request.EmployeeUpdateRequest;
import com.test.HRMS.dto.response.EmployeeFinancialDTO;
import com.test.HRMS.dto.response.EmployeeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {

    EmployeeResponse createEmployee(EmployeeRequest request);
    EmployeeResponse getEmployeeById(Long id);
    EmployeeResponse getEmployeeWithManager(Long id);
    Page<EmployeeResponse> getAllEmployees(Pageable pageable);
    EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request);
    void deleteEmployee(Long id);
    Page<EmployeeResponse> getTeamByManager(Long managerId, Pageable pageable);

    EmployeeFinancialDTO upsertFinancialDetails(Long employeeId, EmployeeFinancialRequest request);
    EmployeeFinancialDTO getFinancialDetails(Long employeeId);

    /** Validates currentPassword then re-encodes and saves newPassword. */
    void changePassword(Long employeeId, String currentPassword, String newPassword);

    /** Admin-level reset: directly sets a new encoded password without verifying the old one. */
    void resetPassword(Long employeeId, String newPassword);
}

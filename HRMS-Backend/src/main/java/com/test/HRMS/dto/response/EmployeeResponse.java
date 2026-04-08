package com.test.HRMS.dto.response;

import com.test.HRMS.entity.EmploymentType;
import com.test.HRMS.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Safe public view of an employee record.
 *
 * Excluded intentionally:
 *  - password (never exposed)
 *  - financialDetails (use dedicated /financial endpoint, ADMIN/HR only)
 *  - directReports list (use /manager/{id}/team endpoint)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private Long            id;
    private String          name;
    private String          email;
    private String          department;
    private Role            role;

    // Personal
    private String          phoneNumber;
    private AddressDTO      address;
    private LocalDate       dateOfBirth;

    // Organizational
    private ManagerSummaryDTO manager;
    private String          designation;
    private EmploymentType  employmentType;
    private LocalDate       dateOfJoining;

    // Audit
    private LocalDateTime   createdAt;
    private LocalDateTime   updatedAt;
}

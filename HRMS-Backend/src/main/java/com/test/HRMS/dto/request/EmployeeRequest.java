package com.test.HRMS.dto.request;

import com.test.HRMS.entity.EmploymentType;
import com.test.HRMS.entity.Role;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Payload for creating a new employee.
 *
 * Financial details are intentionally excluded — use the dedicated
 * POST /api/employees/{id}/financial endpoint (ADMIN/HR only).
 */
@Getter @Setter
public class EmployeeRequest {

    // ── Core ──────────────────────────────────────────────────────────────────

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Role is required")
    private Role role;

    // ── Personal details ──────────────────────────────────────────────────────

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone number must be a valid 10-digit Indian mobile number")
    private String phoneNumber;

    @Valid
    private AddressRequest address;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    // ── Organizational details ────────────────────────────────────────────────

    /** Optional — null means this employee has no manager (top of hierarchy). */
    private Long managerId;

    private String designation;

    private EmploymentType employmentType;

    @PastOrPresent(message = "Date of joining cannot be in the future")
    private LocalDate dateOfJoining;
}

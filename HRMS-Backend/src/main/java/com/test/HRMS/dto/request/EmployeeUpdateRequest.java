package com.test.HRMS.dto.request;

import com.test.HRMS.entity.EmploymentType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/** Payload for updating mutable employee fields. Password and email are not updatable here. */
@Getter @Setter
public class EmployeeUpdateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Department is required")
    private String department;

    // ── Personal details ──────────────────────────────────────────────────────

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone number must be a valid 10-digit Indian mobile number")
    private String phoneNumber;

    @Valid
    private AddressRequest address;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    // ── Organizational details ────────────────────────────────────────────────

    private Long managerId;

    private String designation;

    private EmploymentType employmentType;

    @PastOrPresent(message = "Date of joining cannot be in the future")
    private LocalDate dateOfJoining;
}

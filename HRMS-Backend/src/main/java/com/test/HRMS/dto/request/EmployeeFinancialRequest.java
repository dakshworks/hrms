package com.test.HRMS.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

/**
 * Payload for creating or updating an employee's financial details.
 * Accessible only to ADMIN and HR roles.
 */
@Getter @Setter
public class EmployeeFinancialRequest {

    @NotBlank(message = "Bank account number is required")
    @Pattern(regexp = "^\\d{9,18}$", message = "Bank account number must be 9–18 digits")
    private String bankAccountNumber;

    @NotBlank(message = "IFSC code is required")
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "Invalid IFSC code (e.g. SBIN0001234)")
    private String ifscCode;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "PAN number is required")
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]$", message = "Invalid PAN format (e.g. ABCDE1234F)")
    private String panNumber;
}

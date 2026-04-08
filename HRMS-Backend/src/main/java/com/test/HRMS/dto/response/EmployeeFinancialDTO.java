package com.test.HRMS.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Read-only response DTO for an employee's financial details.
 *
 * Data safety via masking (no raw sensitive values are ever exposed):
 *  - maskedBankAccountNumber — only the last 4 digits are visible
 *    e.g. account "123456789012" is returned as "XXXXXXXX9012"
 *  - maskedPanNumber — first 5 chars and last char are visible, digits are hidden
 *    e.g. PAN "ABCDE1234F" is returned as "ABCDE****F"
 *  - ifscCode and bankName are non-sensitive and returned in full.
 *
 * Access is restricted to ADMIN and HR roles at the API layer.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeFinancialDTO {

    private Long          id;
    private Long          employeeId;
    private String        employeeName;

    /** e.g. "XXXXXXXX9012" — only the last 4 digits of the account number are shown. */
    private String        maskedBankAccountNumber;

    /** Full IFSC code — non-sensitive (e.g. "SBIN0001234"). */
    private String        ifscCode;

    /** Full bank name — non-sensitive (e.g. "State Bank of India"). */
    private String        bankName;

    /** e.g. "ABCDE****F" — first 5 chars and last char visible; the 4 digits are masked. */
    private String        maskedPanNumber;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.test.HRMS.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Stores an employee's banking and tax details in a dedicated table.
 *
 * Why a separate table?
 *  - Isolates sensitive data so the main Employee record never accidentally
 *    exposes financial fields in joins or list queries.
 *  - Only ADMIN / HR roles can read or write this data (enforced at the
 *    controller layer via @PreAuthorize).
 *
 * Data safety approach (simple and interview-friendly):
 *  - Fields are stored as plain text in the database.
 *  - Sensitive values are MASKED before they leave the API — the service
 *    builds an EmployeeFinancialDTO that shows only:
 *      • last 4 digits of the bank account number  (e.g. "XXXXXX3456")
 *      • first 5 chars + last char of the PAN       (e.g. "ABCDE****F")
 *  - Role-based access control (ADMIN / HR only) is the primary access guard.
 *  - In a production system, database-level TDE (Transparent Data Encryption)
 *    on SQL Server handles encryption at the infrastructure layer — no
 *    application-level crypto needed.
 */
@Entity
@Table(name = "employee_financial_details")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EmployeeFinancialDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Each employee has at most one financial details record.
     * LAZY fetch ensures this table is never queried when loading an Employee.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    /**
     * Bank account number — 9 to 18 digits as per RBI guidelines.
     * Stored as plain text; masked in the API response (last 4 digits shown).
     */
    @NotBlank(message = "Bank account number is required")
    @Pattern(regexp = "^\\d{9,18}$", message = "Bank account number must be 9–18 digits")
    @Column(name = "bank_account_number", nullable = false, length = 18)
    private String bankAccountNumber;

    /**
     * IFSC code format: 4-letter bank code + literal '0' + 6-character branch code.
     * Example: SBIN0001234
     */
    @NotBlank(message = "IFSC code is required")
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "Invalid IFSC code format (e.g. SBIN0001234)")
    @Column(name = "ifsc_code", nullable = false, length = 11)
    private String ifscCode;

    /** Name of the bank (e.g. "State Bank of India"). Non-sensitive, shown in full. */
    @NotBlank(message = "Bank name is required")
    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;

    /**
     * PAN — format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F).
     * Stored as plain text; masked in the API response (e.g. "ABCDE****F").
     */
    @NotBlank(message = "PAN number is required")
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]$", message = "Invalid PAN format (e.g. ABCDE1234F)")
    @Column(name = "pan_number", nullable = false, length = 10)
    private String panNumber;

    /** Set automatically when the record is first created. */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Updated automatically whenever the record is modified. */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

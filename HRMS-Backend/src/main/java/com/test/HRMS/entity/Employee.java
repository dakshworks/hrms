package com.test.HRMS.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Core employee record — also the authentication principal.
 *
 * Enhancements over v1:
 *  - Personal details: phoneNumber, address (embedded), dateOfBirth
 *  - Organizational: manager (self-ref), designation, employmentType, dateOfJoining
 *  - Audit: createdAt, updatedAt
 *  - Financial: navigated via @OneToOne(mappedBy) — see EmployeeFinancialDetails
 */
@Entity
@Table(name = "employees")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Core identity ─────────────────────────────────────────────────────────

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @NotBlank(message = "Department is required")
    @Column(nullable = false)
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // ── Personal details ──────────────────────────────────────────────────────

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone number must be a valid 10-digit Indian mobile number")
    @Column(unique = true, length = 15)
    private String phoneNumber;

    /**
     * Structured address stored as individual columns in the employees table.
     * Optional — employees without an address have all address columns as NULL.
     * Validation of address fields happens at the DTO layer (AddressRequest),
     * not here, so partial updates never cause false validation errors.
     */
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "addressLine1", column = @Column(name = "address_line1")),
        @AttributeOverride(name = "addressLine2", column = @Column(name = "address_line2")),
        @AttributeOverride(name = "city",         column = @Column(name = "address_city")),
        @AttributeOverride(name = "state",        column = @Column(name = "address_state")),
        @AttributeOverride(name = "pincode",      column = @Column(name = "address_pincode")),
        @AttributeOverride(name = "country",      column = @Column(name = "address_country"))
    })
    private Address address;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    // ── Organizational details ────────────────────────────────────────────────

    /**
     * Self-referencing manager relationship.
     * The manager column is nullable — top-level employees (e.g. CEO) have no manager.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    /** Employees who report directly to this employee. */
    @OneToMany(mappedBy = "manager", fetch = FetchType.LAZY)
    private List<Employee> directReports;

    @Column(length = 100)
    private String designation;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 20)
    private EmploymentType employmentType;

    @Column(name = "date_of_joining")
    private LocalDate dateOfJoining;

    // ── Financial details (separate table for security) ───────────────────────

    @OneToOne(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private EmployeeFinancialDetails financialDetails;

    // ── Audit ─────────────────────────────────────────────────────────────────

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Existing relationships ────────────────────────────────────────────────

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Leave> leaves;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Attendance> attendances;
}

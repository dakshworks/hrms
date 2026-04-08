package com.test.HRMS.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents an employee's request to work remotely (WFH) for a date range.
 *
 * Indexes are defined on employeeId, startDate, and endDate to support the
 * availability query that filters by employee + overlapping date range efficiently.
 */
@Entity
@Table(
    name = "remote_work_requests",
    indexes = {
        @Index(name = "idx_rwr_employee",   columnList = "employee_id"),
        @Index(name = "idx_rwr_dates",      columnList = "start_date, end_date"),
        @Index(name = "idx_rwr_emp_status", columnList = "employee_id, status")
    }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RemoteWorkRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The employee who submitted the request. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RemoteWorkStatus status = RemoteWorkStatus.PENDING;

    /** Who approved / rejected (populated when status changes from PENDING). */
    @Column(name = "reviewed_by")
    private Long reviewedBy;

    /** When the request was created. */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** When the status was last changed. */
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}

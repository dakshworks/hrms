package com.test.HRMS.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/** A leave request submitted by an employee. */
@Entity
@Table(name = "leaves")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveStatus status;
}

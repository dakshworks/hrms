package com.test.HRMS.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Maps a manager (Employee) to a project identifier.
 *
 * projectId is stored as a String to stay flexible — it can hold a numeric ID,
 * a UUID, or a human-readable project code without schema changes.
 */
@Entity
@Table(
    name = "manager_project_mapping",
    indexes = {
        @Index(name = "idx_mpm_manager",  columnList = "manager_id"),
        @Index(name = "idx_mpm_project",  columnList = "project_id")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_manager_project",
                          columnNames = {"manager_id", "project_id"})
    }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ManagerProjectMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The manager who owns this project assignment.
     * Stored as a plain FK column — no JPA association to avoid loading
     * the full Employee graph when querying by manager.
     */
    @Column(name = "manager_id", nullable = false)
    private Long managerId;

    /**
     * Project identifier — flexible String type to accommodate UUIDs,
     * numeric IDs, or human-readable codes (e.g. "PROJ-42", "proj-alpha").
     */
    @Column(name = "project_id", nullable = false, length = 100)
    private String projectId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

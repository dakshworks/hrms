package com.test.HRMS.repository;

import com.test.HRMS.entity.RemoteWorkRequest;
import com.test.HRMS.entity.RemoteWorkStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RemoteWorkRepository extends JpaRepository<RemoteWorkRequest, Long> {

    /** All requests by a specific employee (paginated). */
    Page<RemoteWorkRequest> findByEmployeeId(Long employeeId, Pageable pageable);

    /** All requests with a given status (paginated) — used by ADMIN/HR review queues. */
    Page<RemoteWorkRequest> findByStatus(RemoteWorkStatus status, Pageable pageable);

    /**
     * Checks whether an employee has an APPROVED remote-work request
     * that overlaps with the given date.
     *
     * Overlap condition: startDate <= date AND endDate >= date
     */
    @Query("""
        SELECT COUNT(r) > 0
        FROM RemoteWorkRequest r
        WHERE r.employee.id = :employeeId
          AND r.status       = 'APPROVED'
          AND r.startDate   <= :date
          AND r.endDate     >= :date
        """)
    boolean existsApprovedRemoteOnDate(
            @Param("employeeId") Long employeeId,
            @Param("date")       LocalDate date);

    /**
     * Batch version — returns the IDs of employees (from the given set)
     * who have an approved remote-work request overlapping the target date.
     * Used by TeamAvailabilityService to avoid N+1 per-employee queries.
     */
    @Query("""
        SELECT DISTINCT r.employee.id
        FROM RemoteWorkRequest r
        WHERE r.employee.id IN :employeeIds
          AND r.status       = 'APPROVED'
          AND r.startDate   <= :date
          AND r.endDate     >= :date
        """)
    List<Long> findRemoteEmployeeIds(
            @Param("employeeIds") List<Long> employeeIds,
            @Param("date")        LocalDate date);
}

package com.test.HRMS.repository;

import com.test.HRMS.entity.Leave;
import com.test.HRMS.entity.LeaveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {

    Page<Leave> findByEmployeeId(Long employeeId, Pageable pageable);

    Page<Leave> findByStatus(LeaveStatus status, Pageable pageable);

    Page<Leave> findByEmployeeIdAndStatus(Long employeeId, LeaveStatus status, Pageable pageable);

    /**
     * Batch query — returns the IDs of employees (from the provided set) who have
     * an APPROVED leave overlapping the target date.
     *
     * Used by TeamAvailabilityService to resolve ON_LEAVE status in a single DB round-trip
     * instead of one query per team member (avoids N+1).
     *
     * Overlap condition: startDate <= date AND endDate >= date
     */
    @Query("""
        SELECT DISTINCT l.employee.id
        FROM Leave l
        WHERE l.employee.id IN :employeeIds
          AND l.status       = 'APPROVED'
          AND l.startDate   <= :date
          AND l.endDate     >= :date
        """)
    List<Long> findOnLeaveEmployeeIds(
            @Param("employeeIds") List<Long> employeeIds,
            @Param("date")        LocalDate date);
}

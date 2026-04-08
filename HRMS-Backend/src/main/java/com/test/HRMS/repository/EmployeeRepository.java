package com.test.HRMS.repository;

import com.test.HRMS.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    /**
     * Paginated list of all employees whose manager is the given ID.
     * Used by GET /api/employees/manager/{managerId}/team
     */
    Page<Employee> findByManagerId(Long managerId, Pageable pageable);

    /**
     * Loads the employee together with their manager in a single JOIN FETCH query.
     * Avoids an extra SELECT (N+1) when the manager field is accessed immediately
     * after loading — used by GET /api/employees/{id}/with-manager.
     */
    @Query("""
        SELECT e FROM Employee e
        LEFT JOIN FETCH e.manager
        WHERE e.id = :id
        """)
    Optional<Employee> findByIdWithManager(@Param("id") Long id);
}

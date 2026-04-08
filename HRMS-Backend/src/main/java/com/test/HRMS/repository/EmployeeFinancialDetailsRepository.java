package com.test.HRMS.repository;

import com.test.HRMS.entity.EmployeeFinancialDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeFinancialDetailsRepository extends JpaRepository<EmployeeFinancialDetails, Long> {

    /**
     * Look up financial details by the owning employee's ID.
     * Returns empty Optional when no record exists yet — the service uses
     * this for the upsert pattern (create on first call, update on subsequent calls).
     */
    Optional<EmployeeFinancialDetails> findByEmployeeId(Long employeeId);
}

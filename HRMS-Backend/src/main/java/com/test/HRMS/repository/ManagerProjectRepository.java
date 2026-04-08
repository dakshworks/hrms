package com.test.HRMS.repository;

import com.test.HRMS.entity.ManagerProjectMapping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ManagerProjectRepository extends JpaRepository<ManagerProjectMapping, Long> {

    Page<ManagerProjectMapping> findByManagerId(Long managerId, Pageable pageable);

    boolean existsByManagerIdAndProjectId(Long managerId, String projectId);

    void deleteByManagerId(Long managerId);
}

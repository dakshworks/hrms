package com.test.HRMS.repository;

import com.test.HRMS.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Page<Attendance> findByEmployeeId(Long employeeId, Pageable pageable);

    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    Page<Attendance> findByDate(LocalDate date, Pageable pageable);
}

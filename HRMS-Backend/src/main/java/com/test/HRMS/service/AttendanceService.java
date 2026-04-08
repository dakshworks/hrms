package com.test.HRMS.service;

import com.test.HRMS.dto.request.AttendanceRequest;
import com.test.HRMS.dto.response.AttendanceResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/** Contract for attendance check-in / check-out management. */
public interface AttendanceService {

    AttendanceResponse checkIn(Long employeeId, AttendanceRequest request);

    AttendanceResponse checkOut(Long employeeId, AttendanceRequest request);

    AttendanceResponse getAttendanceById(Long attendanceId);

    Page<AttendanceResponse> getAttendanceByEmployee(Long employeeId, Pageable pageable);

    Page<AttendanceResponse> getAllAttendance(Pageable pageable);
}

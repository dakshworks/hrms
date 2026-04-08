package com.test.HRMS.service.impl;

import com.test.HRMS.dto.request.AttendanceRequest;
import com.test.HRMS.dto.response.AttendanceResponse;
import com.test.HRMS.entity.Attendance;
import com.test.HRMS.entity.Employee;
import com.test.HRMS.repository.AttendanceRepository;
import com.test.HRMS.repository.EmployeeRepository;
import com.test.HRMS.service.AttendanceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;

@Service
@Slf4j
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository   employeeRepository;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository,
                                 EmployeeRepository employeeRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository   = employeeRepository;
    }

    @Override
    @Transactional
    public AttendanceResponse checkIn(Long employeeId, AttendanceRequest request) {
        if (attendanceRepository.findByEmployeeIdAndDate(employeeId, request.getDate()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Already checked in on: " + request.getDate());
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Employee not found with id: " + employeeId));

        Attendance saved = attendanceRepository.save(Attendance.builder()
                .employee(employee)
                .date(request.getDate())
                .checkIn(LocalTime.now())
                .build());

        log.info("Check-in recorded for employee {} on {}", employeeId, request.getDate());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public AttendanceResponse checkOut(Long employeeId, AttendanceRequest request) {
        Attendance record = attendanceRepository
                .findByEmployeeIdAndDate(employeeId, request.getDate())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "No check-in found for date: " + request.getDate() + ". Please check in first."));

        if (record.getCheckOut() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Already checked out on: " + request.getDate());
        }

        record.setCheckOut(LocalTime.now());
        log.info("Check-out recorded for employee {} on {}", employeeId, request.getDate());
        return toResponse(attendanceRepository.save(record));
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getAttendanceById(Long attendanceId) {
        return attendanceRepository.findById(attendanceId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Attendance not found with id: " + attendanceId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponse> getAttendanceByEmployee(Long employeeId, Pageable pageable) {
        return attendanceRepository.findByEmployeeId(employeeId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponse> getAllAttendance(Pageable pageable) {
        return attendanceRepository.findAll(pageable).map(this::toResponse);
    }

    private AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .employeeId(a.getEmployee().getId())
                .employeeName(a.getEmployee().getName())
                .date(a.getDate())
                .checkIn(a.getCheckIn())
                .checkOut(a.getCheckOut())
                .build();
    }
}

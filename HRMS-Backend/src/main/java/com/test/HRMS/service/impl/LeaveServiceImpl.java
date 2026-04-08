package com.test.HRMS.service.impl;

import com.test.HRMS.dto.request.LeaveRequest;
import com.test.HRMS.dto.request.LeaveStatusRequest;
import com.test.HRMS.dto.response.LeaveResponse;
import com.test.HRMS.entity.Employee;
import com.test.HRMS.entity.Leave;
import com.test.HRMS.entity.LeaveStatus;
import com.test.HRMS.repository.EmployeeRepository;
import com.test.HRMS.repository.LeaveRepository;
import com.test.HRMS.service.LeaveService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Slf4j
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRepository    leaveRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveServiceImpl(LeaveRepository leaveRepository,
                            EmployeeRepository employeeRepository) {
        this.leaveRepository    = leaveRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional
    public LeaveResponse applyLeave(Long employeeId, LeaveRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "End date cannot be before start date");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Employee not found with id: " + employeeId));

        Leave saved = leaveRepository.save(Leave.builder()
                .employee(employee)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .status(LeaveStatus.PENDING)
                .build());

        log.info("Leave id {} created for employee {}", saved.getId(), employeeId);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveResponse getLeaveById(Long leaveId) {
        return leaveRepository.findById(leaveId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Leave not found with id: " + leaveId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LeaveResponse> getLeavesByEmployee(Long employeeId, Pageable pageable) {
        return leaveRepository.findByEmployeeId(employeeId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LeaveResponse> getAllLeaves(Pageable pageable) {
        return leaveRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LeaveResponse> getPendingLeaves(Pageable pageable) {
        return leaveRepository.findByStatus(LeaveStatus.PENDING, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public LeaveResponse updateLeaveStatus(Long leaveId, LeaveStatusRequest request) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Leave not found with id: " + leaveId));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING leaves can be updated. Current status: " + leave.getStatus());
        }
        if (request.getStatus() == LeaveStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot set status back to PENDING");
        }

        leave.setStatus(request.getStatus());
        log.info("Leave {} updated to {}", leaveId, request.getStatus());
        return toResponse(leaveRepository.save(leave));
    }

    @Override
    @Transactional
    public void cancelLeave(Long leaveId, Long requestingEmployeeId) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Leave not found with id: " + leaveId));

        if (!leave.getEmployee().getId().equals(requestingEmployeeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only cancel your own leave requests");
        }
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING leaves can be cancelled. Current status: " + leave.getStatus());
        }

        leaveRepository.delete(leave);
        log.info("Leave {} cancelled by employee {}", leaveId, requestingEmployeeId);
    }

    private LeaveResponse toResponse(Leave l) {
        return LeaveResponse.builder()
                .id(l.getId())
                .employeeId(l.getEmployee().getId())
                .employeeName(l.getEmployee().getName())
                .startDate(l.getStartDate())
                .endDate(l.getEndDate())
                .reason(l.getReason())
                .status(l.getStatus())
                .build();
    }
}

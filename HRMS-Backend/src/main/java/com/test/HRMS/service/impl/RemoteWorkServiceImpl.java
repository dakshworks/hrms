package com.test.HRMS.service.impl;

import com.test.HRMS.dto.request.RemoteWorkRequest;
import com.test.HRMS.dto.request.RemoteWorkStatusRequest;
import com.test.HRMS.dto.response.RemoteWorkResponse;
import com.test.HRMS.entity.Employee;
import com.test.HRMS.entity.RemoteWorkStatus;
import com.test.HRMS.repository.EmployeeRepository;
import com.test.HRMS.repository.RemoteWorkRepository;
import com.test.HRMS.service.RemoteWorkService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@Slf4j
public class RemoteWorkServiceImpl implements RemoteWorkService {

    private final RemoteWorkRepository remoteWorkRepository;
    private final EmployeeRepository   employeeRepository;

    public RemoteWorkServiceImpl(RemoteWorkRepository remoteWorkRepository,
                                 EmployeeRepository employeeRepository) {
        this.remoteWorkRepository = remoteWorkRepository;
        this.employeeRepository   = employeeRepository;
    }

    @Override
    @Transactional
    public RemoteWorkResponse applyRemoteWork(Long employeeId, RemoteWorkRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "End date cannot be before start date");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Employee not found with id: " + employeeId));

        com.test.HRMS.entity.RemoteWorkRequest saved = remoteWorkRepository.save(
                com.test.HRMS.entity.RemoteWorkRequest.builder()
                        .employee(employee)
                        .startDate(request.getStartDate())
                        .endDate(request.getEndDate())
                        .reason(request.getReason())
                        .status(RemoteWorkStatus.PENDING)
                        .build());

        log.info("RemoteWorkRequest id {} created for employee {}", saved.getId(), employeeId);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public RemoteWorkResponse updateStatus(Long requestId, Long reviewerId,
                                           RemoteWorkStatusRequest request) {
        com.test.HRMS.entity.RemoteWorkRequest entity = remoteWorkRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Remote work request not found with id: " + requestId));

        if (entity.getStatus() != RemoteWorkStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING requests can be updated. Current status: " + entity.getStatus());
        }
        if (request.getStatus() == RemoteWorkStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot set status back to PENDING");
        }

        entity.setStatus(request.getStatus());
        entity.setReviewedBy(reviewerId);
        entity.setReviewedAt(LocalDateTime.now());

        log.info("RemoteWorkRequest {} updated to {} by reviewer {}", requestId, request.getStatus(), reviewerId);
        return toResponse(remoteWorkRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RemoteWorkResponse> getMyRequests(Long employeeId, Pageable pageable) {
        return remoteWorkRepository.findByEmployeeId(employeeId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RemoteWorkResponse> getAllRequests(Pageable pageable) {
        return remoteWorkRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public RemoteWorkResponse getById(Long requestId) {
        return remoteWorkRepository.findById(requestId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Remote work request not found with id: " + requestId));
    }

    private RemoteWorkResponse toResponse(com.test.HRMS.entity.RemoteWorkRequest r) {
        return RemoteWorkResponse.builder()
                .id(r.getId())
                .employeeId(r.getEmployee().getId())
                .employeeName(r.getEmployee().getName())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .reason(r.getReason())
                .status(r.getStatus())
                .reviewedBy(r.getReviewedBy())
                .reviewedAt(r.getReviewedAt())
                .createdAt(r.getCreatedAt())
                .build();
    }
}

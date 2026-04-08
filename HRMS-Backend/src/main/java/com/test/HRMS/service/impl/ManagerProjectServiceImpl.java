package com.test.HRMS.service.impl;

import com.test.HRMS.dto.request.ManagerProjectRequest;
import com.test.HRMS.dto.response.ManagerProjectResponse;
import com.test.HRMS.entity.ManagerProjectMapping;
import com.test.HRMS.repository.EmployeeRepository;
import com.test.HRMS.repository.ManagerProjectRepository;
import com.test.HRMS.service.ManagerProjectService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Slf4j
public class ManagerProjectServiceImpl implements ManagerProjectService {

    private final ManagerProjectRepository managerProjectRepository;
    private final EmployeeRepository       employeeRepository;

    public ManagerProjectServiceImpl(ManagerProjectRepository managerProjectRepository,
                                     EmployeeRepository employeeRepository) {
        this.managerProjectRepository = managerProjectRepository;
        this.employeeRepository       = employeeRepository;
    }

    @Override
    @Transactional
    public ManagerProjectResponse assignProject(ManagerProjectRequest request) {
        if (!employeeRepository.existsById(request.getManagerId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Manager not found with id: " + request.getManagerId());
        }
        if (managerProjectRepository.existsByManagerIdAndProjectId(
                request.getManagerId(), request.getProjectId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Manager " + request.getManagerId()
                    + " is already assigned to project '" + request.getProjectId() + "'");
        }

        ManagerProjectMapping saved = managerProjectRepository.save(ManagerProjectMapping.builder()
                .managerId(request.getManagerId())
                .projectId(request.getProjectId())
                .build());

        log.info("Project '{}' assigned to manager {}", request.getProjectId(), request.getManagerId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ManagerProjectResponse> getProjectsByManager(Long managerId, Pageable pageable) {
        return managerProjectRepository.findByManagerId(managerId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public void removeMapping(Long mappingId) {
        ManagerProjectMapping mapping = managerProjectRepository.findById(mappingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Manager-project mapping not found with id: " + mappingId));
        managerProjectRepository.delete(mapping);
        log.info("ManagerProjectMapping id {} removed", mappingId);
    }

    private ManagerProjectResponse toResponse(ManagerProjectMapping m) {
        return ManagerProjectResponse.builder()
                .id(m.getId())
                .managerId(m.getManagerId())
                .projectId(m.getProjectId())
                .createdAt(m.getCreatedAt())
                .build();
    }
}

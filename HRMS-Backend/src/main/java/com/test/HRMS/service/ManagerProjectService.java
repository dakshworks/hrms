package com.test.HRMS.service;

import com.test.HRMS.dto.request.ManagerProjectRequest;
import com.test.HRMS.dto.response.ManagerProjectResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ManagerProjectService {

    ManagerProjectResponse assignProject(ManagerProjectRequest request);
    Page<ManagerProjectResponse> getProjectsByManager(Long managerId, Pageable pageable);
    void removeMapping(Long mappingId);
}

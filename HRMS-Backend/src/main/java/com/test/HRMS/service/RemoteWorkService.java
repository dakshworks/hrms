package com.test.HRMS.service;

import com.test.HRMS.dto.request.RemoteWorkRequest;
import com.test.HRMS.dto.request.RemoteWorkStatusRequest;
import com.test.HRMS.dto.response.RemoteWorkResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RemoteWorkService {

    /** EMPLOYEE submits a WFH request — initial status is PENDING. */
    RemoteWorkResponse applyRemoteWork(Long employeeId, RemoteWorkRequest request);

    /** ADMIN / HR / MANAGER updates the status to APPROVED or REJECTED. */
    RemoteWorkResponse updateStatus(Long requestId, Long reviewerId, RemoteWorkStatusRequest request);

    /** EMPLOYEE views their own WFH requests (paginated). */
    Page<RemoteWorkResponse> getMyRequests(Long employeeId, Pageable pageable);

    /** ADMIN / HR view all WFH requests (paginated). */
    Page<RemoteWorkResponse> getAllRequests(Pageable pageable);

    /** Single request by ID — used internally and for admin detail views. */
    RemoteWorkResponse getById(Long requestId);
}

package com.test.HRMS.service;

import com.test.HRMS.dto.request.LeaveRequest;
import com.test.HRMS.dto.request.LeaveStatusRequest;
import com.test.HRMS.dto.response.LeaveResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/** Contract for leave management operations. */
public interface LeaveService {

    LeaveResponse applyLeave(Long employeeId, LeaveRequest request);

    LeaveResponse getLeaveById(Long leaveId);

    Page<LeaveResponse> getLeavesByEmployee(Long employeeId, Pageable pageable);

    Page<LeaveResponse> getAllLeaves(Pageable pageable);

    Page<LeaveResponse> getPendingLeaves(Pageable pageable);

    LeaveResponse updateLeaveStatus(Long leaveId, LeaveStatusRequest request);

    void cancelLeave(Long leaveId, Long requestingEmployeeId);
}

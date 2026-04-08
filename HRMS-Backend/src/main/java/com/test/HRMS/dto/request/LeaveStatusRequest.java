package com.test.HRMS.dto.request;

import com.test.HRMS.entity.LeaveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/** Payload for HR/Admin to approve or reject a leave. */
@Getter @Setter
public class LeaveStatusRequest {

    @NotNull(message = "Status is required")
    private LeaveStatus status;
}

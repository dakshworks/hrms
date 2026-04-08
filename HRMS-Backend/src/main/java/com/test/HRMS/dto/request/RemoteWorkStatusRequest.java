package com.test.HRMS.dto.request;

import com.test.HRMS.entity.RemoteWorkStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/** Payload for ADMIN / HR / MANAGER to approve or reject a remote-work request. */
@Getter @Setter
public class RemoteWorkStatusRequest {

    @NotNull(message = "Status is required")
    private RemoteWorkStatus status;
}

package com.test.HRMS.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** Payload for assigning a project to a manager. */
@Getter @Setter
public class ManagerProjectRequest {

    @NotNull(message = "Manager ID is required")
    private Long managerId;

    @NotBlank(message = "Project ID is required")
    @Size(max = 100, message = "Project ID must not exceed 100 characters")
    private String projectId;
}

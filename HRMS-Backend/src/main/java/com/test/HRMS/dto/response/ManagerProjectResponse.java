package com.test.HRMS.dto.response;

import lombok.*;

import java.time.LocalDateTime;

/** Read-only view of a ManagerProjectMapping returned by the API. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerProjectResponse {

    private Long          id;
    private Long          managerId;
    private String        projectId;
    private LocalDateTime createdAt;
}

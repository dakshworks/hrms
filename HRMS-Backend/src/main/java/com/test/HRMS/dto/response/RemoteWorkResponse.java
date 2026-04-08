package com.test.HRMS.dto.response;

import com.test.HRMS.entity.RemoteWorkStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Read-only view of a RemoteWorkRequest returned by the API. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RemoteWorkResponse {

    private Long             id;
    private Long             employeeId;
    private String           employeeName;
    private LocalDate        startDate;
    private LocalDate        endDate;
    private String           reason;
    private RemoteWorkStatus status;
    private Long             reviewedBy;
    private LocalDateTime    reviewedAt;
    private LocalDateTime    createdAt;
}

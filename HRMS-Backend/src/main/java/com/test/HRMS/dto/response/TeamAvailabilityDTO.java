package com.test.HRMS.dto.response;

import lombok.*;

/**
 * Represents a single team member who is NOT available today.
 * Only ON_LEAVE and REMOTE statuses appear here — available employees are excluded.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamAvailabilityDTO {

    private Long   employeeId;
    private String name;

    /**
     * Either "ON_LEAVE" or "REMOTE".
     * ON_LEAVE takes priority — if an employee has both an approved leave
     * and an approved remote request for today, they are shown as ON_LEAVE.
     */
    private String status;
}

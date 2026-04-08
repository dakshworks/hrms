package com.test.HRMS.dto.response;

import com.test.HRMS.entity.LeaveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Response payload for a leave request. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveResponse {

    private Long        id;
    private Long        employeeId;
    private String      employeeName;
    private LocalDate   startDate;
    private LocalDate   endDate;
    private String      reason;
    private LeaveStatus status;
}

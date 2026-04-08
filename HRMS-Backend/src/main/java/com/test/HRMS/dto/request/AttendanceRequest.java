package com.test.HRMS.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

/** Payload for check-in and check-out requests. */
@Getter @Setter
public class AttendanceRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;
}

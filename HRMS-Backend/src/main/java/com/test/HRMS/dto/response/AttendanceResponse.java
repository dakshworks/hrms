package com.test.HRMS.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/** Response payload for an attendance record. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {

    private Long      id;
    private Long      employeeId;
    private String    employeeName;
    private LocalDate date;
    private LocalTime checkIn;
    private LocalTime checkOut;   // null until checked out
}

package com.test.HRMS.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Lightweight manager info included in EmployeeResponseDTO to avoid circular serialization. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerSummaryDTO {
    private Long   id;
    private String name;
    private String email;
    private String designation;
    private String department;
}

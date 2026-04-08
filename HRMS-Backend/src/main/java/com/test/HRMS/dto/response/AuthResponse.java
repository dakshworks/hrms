package com.test.HRMS.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/** Returned after successful login — contains the JWT and basic identity info. */
@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String type;        // always "Bearer"
    private Long   employeeId;
    private String email;
    private String role;
}

package com.test.HRMS.service.impl;

import com.test.HRMS.dto.request.LoginRequest;
import com.test.HRMS.dto.response.AuthResponse;
import com.test.HRMS.security.EmployeeUserDetails;
import com.test.HRMS.security.JwtUtils;
import com.test.HRMS.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils              jwtUtils;

    public AuthServiceImpl(AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils              = jwtUtils;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        EmployeeUserDetails principal = (EmployeeUserDetails) authentication.getPrincipal();
        String token = jwtUtils.generateToken(principal);

        log.info("Login successful for employee id: {}", principal.getId());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .employeeId(principal.getId())
                .email(principal.getUsername())
                .role(principal.getAuthorities().iterator().next().getAuthority())
                .build();
    }
}

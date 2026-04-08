package com.test.HRMS.controller;

import com.test.HRMS.dto.request.EmployeeRequest;
import com.test.HRMS.dto.request.LoginRequest;
import com.test.HRMS.dto.response.ApiResponse;
import com.test.HRMS.dto.response.AuthResponse;
import com.test.HRMS.dto.response.EmployeeResponse;
import com.test.HRMS.service.AuthService;
import com.test.HRMS.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public authentication endpoints — no JWT required.
 *
 * POST /api/auth/login          → authenticate, receive JWT
 * POST /api/auth/register       → create a new employee account
 * POST /api/auth/logout         → client-side token invalidation
 */
@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    private final AuthService     authService;
    private final EmployeeService employeeService;

    public AuthController(AuthService authService, EmployeeService employeeService) {
        this.authService     = authService;
        this.employeeService = employeeService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse auth = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(auth, "Login successful"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<EmployeeResponse>> register(
            @Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse employee = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(employee, "Employee registered successfully"));
    }

    /**
     * POST /api/auth/logout
     * JWT is stateless — actual invalidation happens on the client side by deleting the token.
     * This endpoint exists as a clean contract for frontend integration.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        log.info("Logout endpoint called — client should discard the JWT");
        return ResponseEntity.ok(ApiResponse.success(null,
                "Logged out successfully. Please delete your token on the client side."));
    }
}

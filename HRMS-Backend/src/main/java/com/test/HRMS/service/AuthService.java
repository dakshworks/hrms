package com.test.HRMS.service;

import com.test.HRMS.dto.request.LoginRequest;
import com.test.HRMS.dto.response.AuthResponse;

/** Contract for authentication operations. */
public interface AuthService {

    AuthResponse login(LoginRequest request);
}

package com.test.HRMS.config;

import com.test.HRMS.entity.Employee;
import com.test.HRMS.entity.Role;
import com.test.HRMS.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Bootstraps a default ADMIN user on first startup.
 *
 * <p>Runs once per application start via {@link CommandLineRunner}.
 * The check is idempotent: if <em>any</em> employee record already exists the
 * initializer skips creation, so restarting the application never produces
 * duplicate admin accounts.
 *
 * <p>Place this class in the {@code com.test.HRMS.config} package so it sits
 * alongside {@link SecurityConfig} and is picked up automatically by Spring's
 * component scan.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    // ── Default admin credentials ──────────────────────────────────────────────
    private static final String DEFAULT_ADMIN_NAME       = "Admin";
    private static final String DEFAULT_ADMIN_EMAIL      = "admin@gmail.com";
    private static final String DEFAULT_ADMIN_PASSWORD   = "admin123";
    private static final String DEFAULT_ADMIN_DEPARTMENT = "IT";          // required NOT NULL column

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder    passwordEncoder;

    /**
     * Constructor injection keeps the class testable without a full Spring context.
     *
     * @param employeeRepository JPA repository for {@link Employee}
     * @param passwordEncoder    BCrypt encoder declared in {@link SecurityConfig}
     */
    public DataInitializer(EmployeeRepository employeeRepository,
                           PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder    = passwordEncoder;
    }

    /**
     * Entry point called by Spring Boot after the application context is fully loaded.
     *
     * @param args command-line arguments (unused)
     */
    @Override
    public void run(String... args) {

        long count = employeeRepository.count();

        if (count > 0) {
            log.info("DataInitializer: {} employee(s) already exist — skipping default admin creation.", count);
            return;
        }

        log.info("DataInitializer: No employees found. Creating default ADMIN user...");

        Employee admin = Employee.builder()
                .name(DEFAULT_ADMIN_NAME)
                .email(DEFAULT_ADMIN_EMAIL)
                .password(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD))
                .department(DEFAULT_ADMIN_DEPARTMENT)
                .role(Role.ADMIN)
                // Optional fields left null — no validation annotations on the entity
                // require them, and the admin can fill them in via the update endpoint.
                .build();

        employeeRepository.save(admin);

        log.info("DataInitializer: Default ADMIN user created successfully.");
        log.info("  ┌─────────────────────────────────────────┐");
        log.info("  │  Email    : {}              │", DEFAULT_ADMIN_EMAIL);
        log.info("  │  Password : {}  (change immediately!)  │", DEFAULT_ADMIN_PASSWORD);
        log.info("  └─────────────────────────────────────────┘");
        log.warn("DataInitializer: Change the default admin password after first login!");
    }
}

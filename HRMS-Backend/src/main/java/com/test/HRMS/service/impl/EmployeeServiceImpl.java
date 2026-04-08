package com.test.HRMS.service.impl;

import com.test.HRMS.dto.request.AddressRequest;
import com.test.HRMS.dto.request.EmployeeFinancialRequest;
import com.test.HRMS.dto.request.EmployeeRequest;
import com.test.HRMS.dto.request.EmployeeUpdateRequest;
import com.test.HRMS.dto.response.*;
import com.test.HRMS.entity.Address;
import com.test.HRMS.entity.Employee;
import com.test.HRMS.entity.EmployeeFinancialDetails;
import com.test.HRMS.repository.EmployeeFinancialDetailsRepository;
import com.test.HRMS.repository.EmployeeRepository;
import com.test.HRMS.service.EmployeeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Slf4j
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository                 employeeRepository;
    private final EmployeeFinancialDetailsRepository financialRepository;
    private final PasswordEncoder                    passwordEncoder;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                               EmployeeFinancialDetailsRepository financialRepository,
                               PasswordEncoder passwordEncoder) {
        this.employeeRepository  = employeeRepository;
        this.financialRepository = financialRepository;
        this.passwordEncoder     = passwordEncoder;
    }

    // ── Core CRUD ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Employee with email '" + request.getEmail() + "' already exists");
        }
        if (request.getPhoneNumber() != null &&
                employeeRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Employee with phone '" + request.getPhoneNumber() + "' already exists");
        }

        Employee manager = resolveManager(request.getManagerId());

        Employee saved = employeeRepository.save(Employee.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .department(request.getDepartment())
                .role(request.getRole())
                .phoneNumber(request.getPhoneNumber())
                .address(toAddressEntity(request.getAddress()))
                .dateOfBirth(request.getDateOfBirth())
                .manager(manager)
                .designation(request.getDesignation())
                .employmentType(request.getEmploymentType())
                .dateOfJoining(request.getDateOfJoining())
                .build());

        log.info("Employee created — id: {}, email: {}", saved.getId(), saved.getEmail());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeWithManager(Long id) {
        Employee employee = employeeRepository.findByIdWithManager(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Employee not found with id: " + id));
        return toResponse(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request) {
        Employee employee = findOrThrow(id);

        if (request.getPhoneNumber() != null
                && !request.getPhoneNumber().equals(employee.getPhoneNumber())
                && employeeRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Employee with phone '" + request.getPhoneNumber() + "' already exists");
        }

        if (request.getManagerId() != null && request.getManagerId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "An employee cannot be their own manager");
        }

        employee.setName(request.getName());
        employee.setDepartment(request.getDepartment());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setAddress(toAddressEntity(request.getAddress()));
        employee.setDateOfBirth(request.getDateOfBirth());
        employee.setDesignation(request.getDesignation());
        employee.setEmploymentType(request.getEmploymentType());
        employee.setDateOfJoining(request.getDateOfJoining());

        if (request.getManagerId() != null) {
            employee.setManager(resolveManager(request.getManagerId()));
        }

        log.info("Employee id {} updated", id);
        return toResponse(employeeRepository.save(employee));
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        employeeRepository.delete(findOrThrow(id));
        log.info("Employee id {} deleted", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getTeamByManager(Long managerId, Pageable pageable) {
        findOrThrow(managerId);
        return employeeRepository.findByManagerId(managerId, pageable).map(this::toResponse);
    }

    // ── Financial details ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public EmployeeFinancialDTO upsertFinancialDetails(Long employeeId, EmployeeFinancialRequest request) {
        Employee employee = findOrThrow(employeeId);

        EmployeeFinancialDetails details = financialRepository
                .findByEmployeeId(employeeId)
                .orElse(EmployeeFinancialDetails.builder().employee(employee).build());

        details.setBankAccountNumber(request.getBankAccountNumber());
        details.setIfscCode(request.getIfscCode());
        details.setBankName(request.getBankName());
        details.setPanNumber(request.getPanNumber());

        log.info("Financial details saved for employee id: {}", employeeId);
        return toFinancialDTO(financialRepository.save(details), employee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeFinancialDTO getFinancialDetails(Long employeeId) {
        findOrThrow(employeeId);
        EmployeeFinancialDetails details = financialRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Financial details not found for employee id: " + employeeId));
        return toFinancialDTO(details, details.getEmployee());
    }

    // ── Password operations ───────────────────────────────────────────────────

    @Override
    @Transactional
    public void changePassword(Long employeeId, String currentPassword, String newPassword) {
        Employee employee = findOrThrow(employeeId);
        if (!passwordEncoder.matches(currentPassword, employee.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        employee.setPassword(passwordEncoder.encode(newPassword));
        employeeRepository.save(employee);
        log.info("Password changed for employee id: {}", employeeId);
    }

    @Override
    @Transactional
    public void resetPassword(Long employeeId, String newPassword) {
        Employee employee = findOrThrow(employeeId);
        employee.setPassword(passwordEncoder.encode(newPassword));
        employeeRepository.save(employee);
        log.info("Password reset for employee id: {}", employeeId);
    }

    // ── Mapping helpers ───────────────────────────────────────────────────────

    private EmployeeResponse toResponse(Employee e) {
        return EmployeeResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .email(e.getEmail())
                .department(e.getDepartment())
                .role(e.getRole())
                .phoneNumber(e.getPhoneNumber())
                .address(toAddressDTO(e.getAddress()))
                .dateOfBirth(e.getDateOfBirth())
                .manager(e.getManager() == null ? null : ManagerSummaryDTO.builder()
                        .id(e.getManager().getId())
                        .name(e.getManager().getName())
                        .email(e.getManager().getEmail())
                        .designation(e.getManager().getDesignation())
                        .department(e.getManager().getDepartment())
                        .build())
                .designation(e.getDesignation())
                .employmentType(e.getEmploymentType())
                .dateOfJoining(e.getDateOfJoining())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private AddressDTO toAddressDTO(Address a) {
        if (a == null) return null;
        return AddressDTO.builder()
                .addressLine1(a.getAddressLine1())
                .addressLine2(a.getAddressLine2())
                .city(a.getCity())
                .state(a.getState())
                .pincode(a.getPincode())
                .country(a.getCountry())
                .build();
    }

    private Address toAddressEntity(AddressRequest req) {
        if (req == null) return null;
        return Address.builder()
                .addressLine1(req.getAddressLine1())
                .addressLine2(req.getAddressLine2())
                .city(req.getCity())
                .state(req.getState())
                .pincode(req.getPincode())
                .country(req.getCountry())
                .build();
    }

    private EmployeeFinancialDTO toFinancialDTO(EmployeeFinancialDetails d, Employee e) {
        String acct = d.getBankAccountNumber();
        String pan  = d.getPanNumber();
        String maskedAcct = (acct != null && acct.length() >= 4)
                ? "X".repeat(acct.length() - 4) + acct.substring(acct.length() - 4) : "****";
        String maskedPan  = (pan != null && pan.length() == 10)
                ? pan.substring(0, 5) + "****" + pan.charAt(9) : "**********";

        return EmployeeFinancialDTO.builder()
                .id(d.getId())
                .employeeId(e.getId())
                .employeeName(e.getName())
                .maskedBankAccountNumber(maskedAcct)
                .ifscCode(d.getIfscCode())
                .bankName(d.getBankName())
                .maskedPanNumber(maskedPan)
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }

    private Employee resolveManager(Long managerId) {
        if (managerId == null) return null;
        return employeeRepository.findById(managerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Manager not found with id: " + managerId));
    }

    private Employee findOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Employee not found with id: " + id));
    }
}

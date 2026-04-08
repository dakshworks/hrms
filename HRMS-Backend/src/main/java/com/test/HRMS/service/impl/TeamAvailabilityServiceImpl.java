package com.test.HRMS.service.impl;

import com.test.HRMS.dto.response.TeamAvailabilityDTO;
import com.test.HRMS.entity.Employee;
import com.test.HRMS.repository.EmployeeRepository;
import com.test.HRMS.repository.LeaveRepository;
import com.test.HRMS.repository.RemoteWorkRepository;
import com.test.HRMS.service.TeamAvailabilityService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamAvailabilityServiceImpl implements TeamAvailabilityService {

    private final EmployeeRepository   employeeRepository;
    private final LeaveRepository      leaveRepository;
    private final RemoteWorkRepository remoteWorkRepository;

    public TeamAvailabilityServiceImpl(EmployeeRepository employeeRepository,
                                       LeaveRepository leaveRepository,
                                       RemoteWorkRepository remoteWorkRepository) {
        this.employeeRepository   = employeeRepository;
        this.leaveRepository      = leaveRepository;
        this.remoteWorkRepository = remoteWorkRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamAvailabilityDTO> getUnavailableTeamMembers(Long managerId, LocalDate date) {
        List<Employee> team = employeeRepository
                .findByManagerId(managerId, PageRequest.of(0, Integer.MAX_VALUE))
                .getContent();

        if (team.isEmpty()) return Collections.emptyList();

        List<Long> teamIds = team.stream().map(Employee::getId).collect(Collectors.toList());

        Set<Long> onLeaveIds = new HashSet<>(leaveRepository.findOnLeaveEmployeeIds(teamIds, date));
        Set<Long> remoteIds  = new HashSet<>(remoteWorkRepository.findRemoteEmployeeIds(teamIds, date));

        List<TeamAvailabilityDTO> result = new ArrayList<>();
        for (Employee emp : team) {
            Long empId = emp.getId();
            if (onLeaveIds.contains(empId)) {
                result.add(new TeamAvailabilityDTO(empId, emp.getName(), "ON_LEAVE"));
            } else if (remoteIds.contains(empId)) {
                result.add(new TeamAvailabilityDTO(empId, emp.getName(), "REMOTE"));
            }
        }
        return result;
    }
}

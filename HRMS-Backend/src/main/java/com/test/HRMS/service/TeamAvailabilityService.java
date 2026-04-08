package com.test.HRMS.service;

import com.test.HRMS.dto.response.TeamAvailabilityDTO;

import java.time.LocalDate;
import java.util.List;

public interface TeamAvailabilityService {

    /**
     * Returns only the unavailable members of a team for the given date.
     * "Team" is defined as all employees whose managerId equals the given managerId.
     *
     * Priority: ON_LEAVE > REMOTE > (excluded — available)
     *
     * Uses two batch queries (one for leave, one for remote) to avoid N+1.
     *
     * @param managerId the manager whose direct reports form the team
     * @param date      the date to check (usually today)
     * @return list of unavailable team members; never null, may be empty
     */
    List<TeamAvailabilityDTO> getUnavailableTeamMembers(Long managerId, LocalDate date);
}

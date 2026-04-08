package com.test.HRMS.security;

import com.test.HRMS.entity.Employee;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Adapts the {@link Employee} entity to Spring Security's {@link UserDetails} contract.
 * The email is used as the username; the role is prefixed with "ROLE_" per convention.
 */
public class EmployeeUserDetails implements UserDetails {

    private final Long   id;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public EmployeeUserDetails(Employee employee) {
        this.id         = employee.getId();
        this.email      = employee.getEmail();
        this.password   = employee.getPassword();
        this.authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + employee.getRole().name()));
    }

    /** Exposed so controllers can pull the ID directly from the principal. */
    public Long getId() { return id; }

    @Override public String getUsername()  { return email; }
    @Override public String getPassword()  { return password; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}

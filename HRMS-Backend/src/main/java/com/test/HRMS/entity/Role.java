package com.test.HRMS.entity;

/**
 * System roles that control what an authenticated employee can access.
 *
 * ADMIN    — full access: create/delete employees, manage financial details
 * HR       — read and update employees and financial details; cannot delete
 * EMPLOYEE — self-service only: own attendance and leave
 */
public enum Role { ADMIN, HR, EMPLOYEE }

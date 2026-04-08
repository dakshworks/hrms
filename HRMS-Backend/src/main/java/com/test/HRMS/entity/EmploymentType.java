package com.test.HRMS.entity;

/**
 * How an employee is engaged with the company.
 * Stored as a STRING column so the value is readable directly in the database.
 */
public enum EmploymentType {
    /** Permanent salaried employee. */
    FULL_TIME,
    /** Fixed-term or project-based contractor. */
    CONTRACT,
    /** Internship engagement, typically time-limited. */
    INTERN
}

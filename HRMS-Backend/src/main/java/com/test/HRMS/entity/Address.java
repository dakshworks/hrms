package com.test.HRMS.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

/**
 * Structured address embedded directly into the employees table as individual columns.
 *
 * No validation annotations here — this is a JPA entity, not an API boundary.
 * Input validation lives in {@link com.test.HRMS.dto.request.AddressRequest},
 * which uses @NotBlank to enforce required fields before data reaches this class.
 */
@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Address {

    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private String country;
}

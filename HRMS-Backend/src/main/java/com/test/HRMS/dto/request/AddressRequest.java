package com.test.HRMS.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

/**
 * Validated address payload used in both {@link EmployeeRequest} and
 * {@link EmployeeUpdateRequest}. Providing an address is optional at the
 * employee level, but if an address object is present all required fields
 * must be supplied.
 */
@Getter @Setter
public class AddressRequest {

    @NotBlank(message = "Address line 1 is required")
    private String addressLine1;

    /** Optional — e.g. apartment number, floor. */
    private String addressLine2;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    /** Indian PIN code — exactly 6 digits. */
    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Pincode must be a valid 6-digit Indian PIN code")
    private String pincode;

    @NotBlank(message = "Country is required")
    private String country;
}

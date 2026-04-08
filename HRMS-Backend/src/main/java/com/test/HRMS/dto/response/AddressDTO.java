package com.test.HRMS.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Safe public representation of an employee's address. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private String country;
}

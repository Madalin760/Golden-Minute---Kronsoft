package com.goldenminute.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerRegistrationRequest {
    private String name;
    private String fcmToken;
    private Double latitude;
    private Double longitude;

}

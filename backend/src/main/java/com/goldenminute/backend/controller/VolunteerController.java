package com.goldenminute.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.goldenminute.backend.model.Volunteer;
import com.goldenminute.backend.dto.VolunteerRegistrationRequest;
//import com.goldenminute.backend.repository.VolunteerRepository;
import com.goldenminute.backend.service.VolunteerService;

@RestController
@RequestMapping("/api/volunteers")

public class VolunteerController {
    private final VolunteerService volunteerService;

    public VolunteerController(VolunteerService volunteerService) {
        this.volunteerService = volunteerService;

    }

    @PostMapping("/register")
    public ResponseEntity<Volunteer> registerVolunteer(@RequestBody VolunteerRegistrationRequest request) {
        try {
            Volunteer registeredVolunteer = volunteerService.registerVolunteer(request);
            return ResponseEntity.ok(registeredVolunteer);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

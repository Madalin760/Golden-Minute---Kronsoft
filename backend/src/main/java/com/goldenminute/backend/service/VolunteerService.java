package com.goldenminute.backend.service;

import com.goldenminute.backend.model.Volunteer;
import com.goldenminute.backend.repository.VolunteerRepository;
import com.goldenminute.backend.dto.VolunteerRegistrationRequest;

import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class VolunteerService {
    private final VolunteerRepository volunteerRepository;

    public VolunteerService(VolunteerRepository volunteerRepository) {
        this.volunteerRepository = volunteerRepository;
    }

    public Volunteer registerVolunteer(VolunteerRegistrationRequest request) {
        Optional<Volunteer> volunteer = volunteerRepository.findByFcmToken(request.getFcmToken());
        if (volunteer.isPresent()) {
            Volunteer existingVolunteer = volunteer.get();
            existingVolunteer.setLatitude(request.getLatitude());
            existingVolunteer.setLongitude(request.getLongitude());
            existingVolunteer.setName(request.getName());
            existingVolunteer.setIsAvailable(true);
            existingVolunteer.setIsVerified(false);

            return volunteerRepository.save(existingVolunteer);

        } else {
            Volunteer newVolunteer = new Volunteer();
            newVolunteer.setName(request.getName());
            newVolunteer.setFcmToken(request.getFcmToken());
            newVolunteer.setLatitude(request.getLatitude());
            newVolunteer.setLongitude(request.getLongitude());
            newVolunteer.setIsAvailable(true);
            newVolunteer.setIsVerified(false);

            return volunteerRepository.save(newVolunteer);
        }

    }
}
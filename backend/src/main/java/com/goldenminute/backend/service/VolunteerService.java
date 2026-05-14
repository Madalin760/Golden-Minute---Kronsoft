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
        // Prioritizăm căutarea după userId (dacă avem un user logat)
        Optional<Volunteer> volunteer = Optional.empty();
        if (request.getUserId() != null) {
            volunteer = volunteerRepository.findByUserId(request.getUserId());
        }
        if (volunteer.isEmpty()) {
            volunteer = volunteerRepository.findByFcmToken(request.getFcmToken());
        }

        if (volunteer.isPresent()) {
            Volunteer existingVolunteer = volunteer.get();
            existingVolunteer.setLatitude(request.getLatitude());
            existingVolunteer.setLongitude(request.getLongitude());
            existingVolunteer.setName(request.getName());
            existingVolunteer.setFcmToken(request.getFcmToken());
            existingVolunteer.setIsAvailable(true);
            if (request.getUserId() != null) {
                existingVolunteer.setUserId(request.getUserId());
            }

            return volunteerRepository.save(existingVolunteer);

        } else {
            Volunteer newVolunteer = new Volunteer();
            newVolunteer.setName(request.getName());
            newVolunteer.setFcmToken(request.getFcmToken());
            newVolunteer.setLatitude(request.getLatitude());
            newVolunteer.setLongitude(request.getLongitude());
            newVolunteer.setIsAvailable(true);
            newVolunteer.setIsVerified(false);
            newVolunteer.setUserId(request.getUserId());

            return volunteerRepository.save(newVolunteer);
        }
    }
}
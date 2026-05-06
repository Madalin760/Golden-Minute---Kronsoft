package com.goldenminute.backend.service;

import com.goldenminute.backend.dto.IncidentRequest;
import com.goldenminute.backend.dto.IncidentResponse;
import com.goldenminute.backend.model.Aed;
import com.goldenminute.backend.model.Incident;
import com.goldenminute.backend.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import com.goldenminute.backend.model.Volunteer;
import com.goldenminute.backend.repository.VolunteerRepository;
import com.goldenminute.backend.model.IncidentDispatch;
import com.goldenminute.backend.repository.IncidentDispatchRepository;
import com.goldenminute.backend.dto.NotificationRequest;

@Service
public class IncidentService {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private AedService aedService;

    @Autowired
    private RoutingService routingService;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private IncidentDispatchRepository incidentDispatchRepository;

    public IncidentResponse createIncident(IncidentRequest request) {

        // 1. Salveaza incidentul
        Incident incident = new Incident(
                request.getLatitude(),
                request.getLongitude(),
                request.getType());
        incident = incidentRepository.save(incident);

        final Incident savedIncident = incident;

        // 2. Porneste toate 3 in paralel
        CompletableFuture<List<Aed>> aedFuture = CompletableFuture
                .supplyAsync(() -> aedService.findNearest(
                        savedIncident.getLatitude(),
                        savedIncident.getLongitude()));

        CompletableFuture<String> volunteerFuture = CompletableFuture
                .supplyAsync(() -> {
                    List<Volunteer> topVolunteers = volunteerRepository.findTop5Volunteers(savedIncident.getLatitude(),
                            savedIncident.getLongitude());
                    for (Volunteer volunteer : topVolunteers) {
                        notifyVolunteer(volunteer, savedIncident);
                    }
                    return "Voluntari alertati — in asteptare Firebase";
                });

        CompletableFuture<String> routeFuture = CompletableFuture
                .supplyAsync(() -> routingService.getOptimalRoute(
                        savedIncident.getLatitude(),
                        savedIncident.getLongitude(),
                        44.4559, 26.0970 // coordonate demo ambulanta
                ));

        // 3. Asteapta toate 3 sa termine
        CompletableFuture.allOf(aedFuture, volunteerFuture, routeFuture).join();

        // 4. Colecteaza rezultatele
        List<Aed> nearbyAeds = aedFuture.join();
        String volunteerStatus = volunteerFuture.join();
        String routeStatus = routeFuture.join();

        // 5. Returneaza tot
        return new IncidentResponse(savedIncident, nearbyAeds,
                volunteerStatus, routeStatus);
    }

    private void notifyVolunteer(Volunteer volunteer, Incident incident) {
        IncidentDispatch incidentDispatch = new IncidentDispatch();
        incidentDispatch.setIncident(incident);
        incidentDispatch.setVolunteer(volunteer);
        incidentDispatch.setStatus(IncidentDispatch.DispatchStatus.PENDING);

        incidentDispatch.setSentAt(java.time.LocalDateTime.now());

        incidentDispatchRepository.save(incidentDispatch);

        NotificationRequest notificationRequest = new NotificationRequest(volunteer.getFcmToken(), "Urgenta medicala!",
                "Avem nevoie de tine in apropiere!", incident.getId());
        notificationService.sendPushNotification(notificationRequest);
    }

    @Transactional
    public String acceptIncident(Long incidentId, Long volunteerId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        if (!"ACTIVE".equals(incident.getStatus())) {
            return "Incidentul a fost deja preluat de altcineva!";
        }
        incident.setStatus("ASSIGNED");
        incidentRepository.save(incident);

        IncidentDispatch incidentDispatch = incidentDispatchRepository
                .findByIncidentIdAndVolunteerId(incidentId, volunteerId)
                .orElseThrow(() -> new RuntimeException("Dispatch not found"));
        incidentDispatch.setStatus(IncidentDispatch.DispatchStatus.ACCEPTED);
        incidentDispatch.setRespondedAt(java.time.LocalDateTime.now());
        incidentDispatchRepository.save(incidentDispatch);

        List<IncidentDispatch> pendingDispatches = incidentDispatchRepository.findByIncidentIdAndStatus(incidentId,
                IncidentDispatch.DispatchStatus.PENDING);
        for (IncidentDispatch dispatch : pendingDispatches) {
            dispatch.setStatus(IncidentDispatch.DispatchStatus.CANCELED);

            dispatch.setRespondedAt(java.time.LocalDateTime.now());

            incidentDispatchRepository.save(dispatch);

            NotificationRequest cancelRequest = new NotificationRequest(dispatch.getVolunteer().getFcmToken(),
                    "Misiune preluata", "Un alt voluntar a fost mai rapid si a preluat incidentul. Iti multumim!",
                    incidentId);

            notificationService.sendPushNotification(cancelRequest);
        }

        return "Ai acceptat incidentul! Drum bun!";
    }
}
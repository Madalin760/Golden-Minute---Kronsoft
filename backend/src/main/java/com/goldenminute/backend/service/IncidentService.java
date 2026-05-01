package com.goldenminute.backend.service;

import com.goldenminute.backend.dto.IncidentRequest;
import com.goldenminute.backend.dto.IncidentResponse;
import com.goldenminute.backend.model.Aed;
import com.goldenminute.backend.model.Incident;
import com.goldenminute.backend.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class IncidentService {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private AedService aedService;

    public IncidentResponse createIncident(IncidentRequest request) {

        // 1. Salveaza incidentul
        Incident incident = new Incident(
            request.getLatitude(),
            request.getLongitude(),
            request.getType()
        );
        incident = incidentRepository.save(incident);

        final Incident savedIncident = incident;

        // 2. Porneste toate 3 in paralel
        CompletableFuture<List<Aed>> aedFuture = CompletableFuture
            .supplyAsync(() -> aedService.findNearest(
                savedIncident.getLatitude(),
                savedIncident.getLongitude()
            ));

        CompletableFuture<String> volunteerFuture = CompletableFuture
            .supplyAsync(() -> {
                // Robert implementeaza asta cu Firebase
                // Momentan returnam un placeholder
                return "Voluntari alertati — in asteptare Firebase";
            });

        CompletableFuture<String> routeFuture = CompletableFuture
            .supplyAsync(() -> {
                // Google Maps API — urmatorul pas
                return "Ruta calculata — in asteptare Google Maps API";
            });

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
}
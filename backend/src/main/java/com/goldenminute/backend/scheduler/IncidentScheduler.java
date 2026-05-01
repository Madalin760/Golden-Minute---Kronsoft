package com.goldenminute.backend.scheduler;

import com.goldenminute.backend.model.Incident;
import com.goldenminute.backend.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class IncidentScheduler {

    @Autowired
    private IncidentRepository incidentRepository;

    // Ruleaza la fiecare 60 secunde
    @Scheduled(fixedRate = 60000)
    public void closeExpiredIncidents() {

        LocalDateTime thirtyMinutesAgo = LocalDateTime.now().minusMinutes(30);

        List<Incident> activeIncidents = incidentRepository.findByStatus("ACTIVE");

        for (Incident incident : activeIncidents) {

            // Ignora incidentele fara data — cele vechi din teste
            if (incident.getCreatedAt() == null) {
                continue;
            }

            if (incident.getCreatedAt().isBefore(thirtyMinutesAgo)) {
                incident.setStatus("CLOSED");
                incidentRepository.save(incident);
                System.out.println("Incident #" + incident.getId() + " inchis automat dupa 30 minute");
            }
        }
    }
}
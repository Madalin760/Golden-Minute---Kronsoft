package com.goldenminute.backend.dto;

import com.goldenminute.backend.model.Aed;
import com.goldenminute.backend.model.Incident;

import java.util.List;

public class IncidentResponse {

    private Incident incident;
    private List<Aed> nearbyAeds;
    private String volunteerStatus;
    private String routeStatus;
    private String message;

    public IncidentResponse(Incident incident,
                            List<Aed> nearbyAeds,
                            String volunteerStatus,
                            String routeStatus) {
        this.incident = incident;
        this.nearbyAeds = nearbyAeds;
        this.volunteerStatus = volunteerStatus;
        this.routeStatus = routeStatus;
        this.message = nearbyAeds.isEmpty()
            ? "Niciun AED gasit in raza de 500m"
            : nearbyAeds.size() + " AED-uri gasite in proximitate";
    }

    public Incident getIncident() { return incident; }
    public List<Aed> getNearbyAeds() { return nearbyAeds; }
    public String getVolunteerStatus() { return volunteerStatus; }
    public String getRouteStatus() { return routeStatus; }
    public String getMessage() { return message; }
}
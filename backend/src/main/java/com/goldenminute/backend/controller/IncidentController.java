package com.goldenminute.backend.controller;

import com.goldenminute.backend.dto.IncidentRequest;
import com.goldenminute.backend.dto.IncidentResponse;
import com.goldenminute.backend.service.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    @PostMapping
    public ResponseEntity<IncidentResponse> createIncident(
            @RequestBody IncidentRequest request) {

        IncidentResponse response = incidentService.createIncident(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public String test() {
        return "GoldenMinute merge!";
    }

    @PostMapping("/{incidentId}/accept")
    public ResponseEntity<String> acceptIncident(@PathVariable Long incidentId, @RequestParam Long volunteerId) {
        String mesaj = incidentService.acceptIncident(incidentId, volunteerId);
        if (mesaj.contains("deja preluat")) {
            return ResponseEntity.status(409).body(mesaj);
        }
        return ResponseEntity.ok(mesaj);
    }
}
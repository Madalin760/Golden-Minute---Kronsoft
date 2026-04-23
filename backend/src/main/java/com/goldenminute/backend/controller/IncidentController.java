package com.goldenminute.backend.controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    @PostMapping
    public String createIncident(){
        return "Incident primit";
    }

    @GetMapping("/test")
    public String test(){
        return "Golden Minute ruleaza cu succes";
    }

    @GetMapping("/verificare")
    public String verificare(){
        return "zi ceva";
    }
}

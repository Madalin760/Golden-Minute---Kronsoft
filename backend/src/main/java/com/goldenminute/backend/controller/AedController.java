package com.goldenminute.backend.controller;

import com.goldenminute.backend.model.Aed;
import com.goldenminute.backend.repository.AedRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// http://localhost:8081/api/aeds/nearest?lat=44.43&lng=26.10&radius=10000 link pentru baietii de la frontend

@RestController
@RequestMapping("/api/aeds")
public class AedController {

    private final AedRepository aedRepository;

    public AedController(AedRepository aedRepository) {
        this.aedRepository = aedRepository;
    }

    @GetMapping("/nearest")
    public List<Aed> searchAeds(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radius) {

        return aedRepository.findAedsWithinRadius(lat, lng, radius);
    }
}
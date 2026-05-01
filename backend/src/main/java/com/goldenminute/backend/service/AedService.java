package com.goldenminute.backend.service;

import com.goldenminute.backend.model.Aed;
import com.goldenminute.backend.repository.AedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AedService {

    @Autowired
    private AedRepository aedRepository;

    public List<Aed> findNearest(double lat, double lng) {
        return aedRepository.findNearest(lat, lng, 500);
    }
}
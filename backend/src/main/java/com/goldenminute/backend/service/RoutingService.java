package com.goldenminute.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class RoutingService {

    @Value("${google.maps.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getOptimalRoute(double originLat, double originLng,
                                   double destLat, double destLng) {
        try {
            String url = String.format(
                "https://maps.googleapis.com/maps/api/directions/json" +
                "?origin=%s,%s&destination=%s,%s&mode=driving&key=%s",
                originLat, originLng, destLat, destLng, apiKey
            );

            String response = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(response);

            // Verifica daca raspunsul e OK
            String status = root.path("status").asText();
            if (!status.equals("OK")) {
                return "Eroare Google Maps: " + status;
            }

            JsonNode leg = root
                .path("routes").get(0)
                .path("legs").get(0);

            String duration = leg.path("duration")
                                 .path("text").asText();
            String distance = leg.path("distance")
                                 .path("text").asText();

            return String.format("Distanta: %s | ETA: %s", distance, duration);

        } catch (Exception e) {
            return "Ruta indisponibila: " + e.getMessage();
        }
    }
}
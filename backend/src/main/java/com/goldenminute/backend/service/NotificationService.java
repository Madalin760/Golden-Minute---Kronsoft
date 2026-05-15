package com.goldenminute.backend.service;

import com.google.firebase.messaging.FirebaseMessaging;
import org.springframework.stereotype.Service;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.goldenminute.backend.dto.NotificationRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import java.util.Map;
import java.util.HashMap;

@Service
public class NotificationService {
    @Async
    public void sendPushNotification(NotificationRequest request) {
        try {
            // Dacă token-ul este de la Expo (pentru testare în Expo Go sau simulatoare)
            if (request.getToken() != null && request.getToken().startsWith("ExponentPushToken")) {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                Map<String, Object> body = new HashMap<>();
                body.put("to", request.getToken());
                body.put("title", request.getTitle());
                body.put("body", request.getBody());
                body.put("sound", "default");
                body.put("data", Map.of("incidentId", request.getIncidentId()));
                
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
                String response = restTemplate.postForObject("https://exp.host/--/api/v2/push/send", entity, String.class);
                System.out.println("Succes trimitere Expo Push: " + response);
                return;
            }

            // Altfel, folosește Firebase standard pentru token-uri native
            Notification notification = Notification.builder()
                    .setTitle(request.getTitle())
                    .setBody(request.getBody())
                    .build();

            Message message = Message.builder()
                    .setToken(request.getToken())
                    .setNotification(notification)
                    .putData("incidentId", String.valueOf(request.getIncidentId()))
                    .build();
            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("Succes trimitere FCM: " + response);
        } catch (FirebaseMessagingException e) {
            System.err.println("Eroare FCM (token invalid sau alta problema): " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Eroare trimitere notificare: " + e.getMessage());
        }
    }
}
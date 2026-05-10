package com.goldenminute.backend.service;

import com.google.firebase.messaging.FirebaseMessaging;
import org.springframework.stereotype.Service;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.goldenminute.backend.dto.NotificationRequest;
import org.springframework.scheduling.annotation.Async;

@Service
public class NotificationService {
    @Async
    public void sendPushNotification(NotificationRequest request) {
        try {
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
        }
    }
}
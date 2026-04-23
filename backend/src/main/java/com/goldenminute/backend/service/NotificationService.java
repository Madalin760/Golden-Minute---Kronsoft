package com.goldenminute.backend.service;

import com.google.firebase.messaging.FirebaseMessaging;
import org.springframework.stereotype.Service;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.goldenminute.backend.dto.NotificationRequest;

@Service
public class NotificationService {
    public String sendNotification(NotificationRequest request) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(request.getTitle())
                    .setBody(request.getBody())
                    .build();

            Message message = Message.builder()
                    .setToken(request.getToken())
                    .setNotification(notification)
                    .build();
            String response = FirebaseMessaging.getInstance().send(message);
            return response;
        } catch (FirebaseMessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send notification", e);
        }
    }
}
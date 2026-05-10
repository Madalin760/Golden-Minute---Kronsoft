package com.goldenminute.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import jakarta.annotation.PostConstruct;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {
    @Value("${firebase.service-account.path}")
    private String serviceAccountPath;

    @PostConstruct
    public void initFirebase() {
        // Skip Firebase initialization if no real service account is configured
        if (serviceAccountPath == null || serviceAccountPath.isBlank() || serviceAccountPath.equals("dummy")) {
            System.out.println("[FirebaseConfig] WARNING: Firebase not configured (path='" + serviceAccountPath + "'). " +
                    "Push notifications will be disabled. Set 'firebase.service-account.path' to enable.");
            return;
        }

        ClassPathResource resource = new ClassPathResource(serviceAccountPath);
        if (!resource.exists()) {
            System.out.println("[FirebaseConfig] WARNING: Firebase service account file not found at '" +
                    serviceAccountPath + "'. Push notifications will be disabled.");
            return;
        }

        try {
            InputStream serviceAccount = resource.getInputStream();
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount)).build();
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("[FirebaseConfig] Firebase initialized successfully.");
            }
        } catch (Exception e) {
            // Log but don't crash — Firebase is optional during development
            System.out.println("[FirebaseConfig] WARNING: Failed to initialize Firebase: " + e.getMessage() +
                    ". Push notifications will be disabled.");
        }
    }
}

package com.goldenminute.backend.dto;

public class NotificationRequest {
    private String token;
    private String title;
    private String body;
    private Long incidentId;

    public NotificationRequest() {
    }

    public NotificationRequest(String token, String title, String body, Long incidentId) {
        this.token = token;
        this.title = title;
        this.body = body;
        this.incidentId = incidentId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(Long incidentId) {
        this.incidentId = incidentId;
    }
}

package com.goldenminute.backend.model;
import jakarta.persistence.*;

@Entity
@Table(name = "incidents")
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double latitude;
    private Double longitude;
    private String type;
    private String status;

    // Constructori
    public Incident() {}

    public Incident(Double latitude, Double longitude, String type){
        this.latitude = latitude;
        this.longitude = longitude;
        this.type = "CARDIAC_ARREST";
        this.status = "ACTIVE";
    }
    // Getteri si Setteri
    public Long getId() { return id; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

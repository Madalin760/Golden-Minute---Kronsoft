package com.goldenminute.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "volunteers")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Volunteer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String name;
    @Column(unique = true)
    private String fcmToken;
    private Double latitude;
    private Double longitude;
    private Boolean isAvailable;
    private Boolean isVerified;

}

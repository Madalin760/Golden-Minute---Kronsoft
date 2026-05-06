package com.goldenminute.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "incident_dispatch")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentDispatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @ManyToOne
    @JoinColumn(name = "volunteer_id", nullable = false)
    private Volunteer volunteer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DispatchStatus status;

    private LocalDateTime sentAt;

    private LocalDateTime respondedAt;

    public enum DispatchStatus {
        PENDING,
        ACCEPTED,
        DECLINED,
        CANCELED
    }
}

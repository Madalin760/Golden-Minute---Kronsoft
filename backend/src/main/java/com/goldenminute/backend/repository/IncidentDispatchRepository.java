package com.goldenminute.backend.repository;

import com.goldenminute.backend.model.IncidentDispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentDispatchRepository extends JpaRepository<IncidentDispatch, Long> {

    List<IncidentDispatch> findByIncidentId(Long incidentId);

    List<IncidentDispatch> findByIncidentIdAndStatus(Long incidentId, IncidentDispatch.DispatchStatus status);

    Optional<IncidentDispatch> findByIncidentIdAndVolunteerId(Long incidentId, Long volunteerId);
}

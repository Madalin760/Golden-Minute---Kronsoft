package com.goldenminute.backend.repository;

import com.goldenminute.backend.model.Volunteer;
import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
    Optional<Volunteer> findByFcmToken(String fcmToken);

}

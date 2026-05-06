package com.goldenminute.backend.repository;

import com.goldenminute.backend.model.Volunteer;
import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
    Optional<Volunteer> findByFcmToken(String fcmToken);

    @Query(value = "SELECT * FROM volunteers v " +
            "WHERE v.is_available = true " +
            "AND ST_DWithin(ST_MakePoint(v.longitude, v.latitude)::geography, ST_MakePoint(:lng, :lat)::geography, 500) "
            +
            "ORDER BY ST_Distance(ST_MakePoint(v.longitude, v.latitude)::geography, ST_MakePoint(:lng, :lat)::geography) ASC "
            +
            "LIMIT 5", nativeQuery = true)
    List<Volunteer> findTop5Volunteers(@Param("lat") Double lat, @Param("lng") Double lng);
}

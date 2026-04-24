package com.goldenminute.backend.repository;

import com.goldenminute.backend.model.Aed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AedRepository extends JpaRepository<Aed, Long> {

    @Query(value = "SELECT * FROM aeds WHERE (6371000 * acos(cos(radians(:lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(latitude)))) < :radius ORDER BY (6371000 * acos(cos(radians(:lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(latitude)))) ASC", nativeQuery = true)
    List<Aed> findAedsWithinRadius(@Param("lat") double lat, @Param("lng") double lng, @Param("radius") double radius);
}

package com.goldenminute.backend.repository;

import com.goldenminute.backend.model.Aed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AedRepository extends JpaRepository<Aed, Long> {

    @Query(value = """
        SELECT * FROM aeds
        WHERE ST_DWithin(
            ST_Point(longitude, latitude)::geography,
            ST_Point(:lng, :lat)::geography,
            :radius
        )
        ORDER BY ST_Distance(
            ST_Point(longitude, latitude)::geography,
            ST_Point(:lng, :lat)::geography
        )
        LIMIT 3
        """, nativeQuery = true)
    List<Aed> findNearest(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radius") double radius
    );
}
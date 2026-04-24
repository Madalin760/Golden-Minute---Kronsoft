package com.goldenminute.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goldenminute.backend.model.Aed;
import com.goldenminute.backend.repository.AedRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final AedRepository aedRepository;

    public DataLoader(AedRepository aedRepository) {
        this.aedRepository = aedRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        //aedRepository.deleteAll();

        if (aedRepository.count() == 0) {
            System.out.println("Baza de date este goala. Incepem importul fișierului aeds_oficial.json...");

            ObjectMapper mapper = new ObjectMapper();

            InputStream inputStream = new ClassPathResource("aed_oficial.json").getInputStream();

            // Citim tot JSON-ul
            JsonNode rootNode = mapper.readTree(inputStream);
            JsonNode onArray = rootNode.get("On");

            List<Aed> aedsToSave = new ArrayList<>();

            if (onArray != null && onArray.isArray()) {
                for (JsonNode node : onArray) {
                    Aed aed = new Aed();

                    // Extragem doar datele care ne intereseaza
                    aed.setName(node.get("titlu").asText());
                    aed.setAddress(node.get("adresa").asText());

                    // Coordonatele sunt trecute cu ghilimele (String) în JSON, asa că le transformam în numere (Double)
                    try {
                        aed.setLatitude(Double.parseDouble(node.get("latitudine").asText()));
                        aed.setLongitude(Double.parseDouble(node.get("longitudine").asText()));
                        aedsToSave.add(aed);
                    } catch (Exception e) {
                        // Daca un rand nu are coordonate corecte, il ignoram pentru a nu bloca aplicatia
                    }
                }
            }

            // Salvam toate cele mii de puncte în PostgreSQL dintr-o singura mișcare
            aedRepository.saveAll(aedsToSave);
            System.out.println("Import finalizat! Au fost salvate " + aedsToSave.size() + " defibrilatoare în baza de date.");
        } else {
            System.out.println("Baza de date are deja " + aedRepository.count() + " defibrilatoare. Sarim peste import.");
        }
    }
}
package com.goldenminute.backend.controller;

import com.goldenminute.backend.dto.AuthResponse;
import com.goldenminute.backend.dto.LoginRequest;
import com.goldenminute.backend.dto.RegisterRequest;
import com.goldenminute.backend.model.User;
import com.goldenminute.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Verifică dacă email-ul există deja
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new AuthResponse(null, null, null, null, "Acest email este deja înregistrat."));
        }

        // Creează user-ul nou
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setPhone(request.getPhone());

        user = userRepository.save(user);

        return ResponseEntity.ok(new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getPhone()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Caută user-ul după email
        return userRepository.findByEmail(request.getEmail())
                .map(user -> {
                    // Verifică parola
                    if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        return ResponseEntity.ok(
                                new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getPhone()));
                    } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(new AuthResponse(null, null, null, null, "Email sau parolă greșite."));
                    }
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse(null, null, null, null, "Email sau parolă greșite.")));
    }
}

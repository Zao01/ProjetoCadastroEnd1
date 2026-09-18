package com.desafio.sustentacao.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/status")
@CrossOrigin(origins = "*")
public class StatusController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> statusMap = new HashMap<>();
        statusMap.put("status", "UP");
        statusMap.put("servico", "Sustentação Backend API");
        statusMap.put("timestamp", LocalDateTime.now().toString());
        statusMap.put("ambiente", "Desenvolvimento / Sustentação");
        return ResponseEntity.ok(statusMap);
    }
}

package com.desafio.sustentacao.controller;

import com.desafio.sustentacao.entity.Usuario;
import com.desafio.sustentacao.repository.UsuarioRepository;
import com.desafio.sustentacao.security.JwtService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String cpfLimpo = request.getCpf().replaceAll("\\D", "");
        Usuario usuario = usuarioRepository.findByCpf(cpfLimpo)
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas."));

        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            return ResponseEntity.status(401).body("Credenciais inválidas.");
        }

        String token = jwtService.gerarToken(usuario.getCpf(), usuario.getRole().name(), usuario.getId());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", usuario.getRole().name(),
                "usuarioId", usuario.getId(),
                "nome", usuario.getNome()));
    }

    @Data
    public static class LoginRequest {
        private String cpf;
        private String senha;
    }
}
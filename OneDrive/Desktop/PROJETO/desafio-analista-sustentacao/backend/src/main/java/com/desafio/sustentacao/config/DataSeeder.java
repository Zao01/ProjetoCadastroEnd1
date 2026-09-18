package com.desafio.sustentacao.config;

import com.desafio.sustentacao.entity.Role;
import com.desafio.sustentacao.entity.Usuario;
import com.desafio.sustentacao.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @SuppressWarnings("null")
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            usuarioRepository.save(Usuario.builder()
                    .nome("Administrador do Sistema")
                    .cpf("13779617706")
                    .dataNascimento(LocalDate.of(1990, 1, 1))
                    .senha(passwordEncoder.encode("adm123"))
                    .role(Role.ROLE_ADMIN)
                    .build());

            usuarioRepository.save(Usuario.builder()
                    .nome("Usuário Marcos")
                    .cpf("12345678911")
                    .dataNascimento(LocalDate.of(1995, 5, 15))
                    .senha(passwordEncoder.encode("user123"))
                    .role(Role.ROLE_USUARIO)
                    .build());

            System.out.println("✅ Usuários iniciais gerados com sucesso!");
        }
    }
}
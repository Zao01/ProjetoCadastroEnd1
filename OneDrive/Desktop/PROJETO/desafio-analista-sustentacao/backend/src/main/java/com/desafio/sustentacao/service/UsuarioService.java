package com.desafio.sustentacao.service;

import com.desafio.sustentacao.dto.UsuarioDTO;
import com.desafio.sustentacao.entity.Role;
import com.desafio.sustentacao.entity.Usuario;
import com.desafio.sustentacao.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import com.desafio.sustentacao.security.SecurityService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityService securityService;

    @SuppressWarnings("null")
    public Usuario criarUsuario(UsuarioDTO dto) {
        String cpfLimpo = dto.getCpf().replaceAll("\\D", "");

        if (usuarioRepository.existsByCpf(cpfLimpo)) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este CPF.");
        }

        Role roleParaCadastrar = Role.ROLE_USUARIO;
        var principal = securityService.getUsuarioAutenticado();
        if (principal != null) {
            if (!principal.isAdmin()) {
                throw new AccessDeniedException("Usuário comum não possui permissão para cadastrar novos usuários.");
            }
            if (dto.getRole() != null) {
                roleParaCadastrar = dto.getRole();
            }
        }

        Usuario usuario = Usuario.builder()
                .nome(dto.getNome())
                .cpf(cpfLimpo)
                .dataNascimento(dto.getDataNascimento())
                .senha(passwordEncoder.encode(dto.getSenha()))
                .role(roleParaCadastrar)
                .build();

        return usuarioRepository.save(usuario);
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    @SuppressWarnings("null")
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
    }

    @org.springframework.transaction.annotation.Transactional
    @SuppressWarnings("null")
    public void deletarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        usuarioRepository.delete(usuario);
    }
}
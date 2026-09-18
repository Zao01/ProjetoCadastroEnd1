package com.desafio.sustentacao.security;

import com.desafio.sustentacao.entity.Endereco;
import com.desafio.sustentacao.repository.EnderecoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final EnderecoRepository enderecoRepository;

    public UsuarioPrincipal getUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            return principal;
        }
        return null;
    }

    public boolean isAdmin() {
        UsuarioPrincipal principal = getUsuarioAutenticado();
        return principal != null && principal.isAdmin();
    }

    public boolean isMesmoUsuarioOuAdmin(Long usuarioId) {
        UsuarioPrincipal principal = getUsuarioAutenticado();
        if (principal == null) {
            return false;
        }
        if (principal.isAdmin()) {
            return true;
        }
        return principal.getId() != null && principal.getId().equals(usuarioId);
    }

    @SuppressWarnings("null")
    public boolean isDonoDoEnderecoOuAdmin(Long enderecoId) {
        UsuarioPrincipal principal = getUsuarioAutenticado();
        if (principal == null) {
            return false;
        }
        if (principal.isAdmin()) {
            return true;
        }
        if (enderecoId == null || principal.getId() == null) {
            return false;
        }

        Optional<Endereco> enderecoOpt = enderecoRepository.findById(enderecoId);
        return enderecoOpt.isPresent() &&
                enderecoOpt.get().getUsuario() != null &&
                principal.getId().equals(enderecoOpt.get().getUsuario().getId());
    }
}

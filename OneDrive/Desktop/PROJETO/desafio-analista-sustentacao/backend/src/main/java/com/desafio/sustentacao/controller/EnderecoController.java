package com.desafio.sustentacao.controller;

import com.desafio.sustentacao.dto.ViaCepDTO;
import com.desafio.sustentacao.entity.Endereco;
import com.desafio.sustentacao.security.SecurityService;
import com.desafio.sustentacao.service.EnderecoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enderecos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EnderecoController {

    private final EnderecoService enderecoService;
    private final SecurityService securityService;

    @GetMapping("/consulta-cep/{cep}")
    public ResponseEntity<ViaCepDTO> consultarCep(@PathVariable String cep) {
        return ResponseEntity.ok(enderecoService.consultarCep(cep));
    }

    /**
     * Administrador: Pode visualizar todos os endereços cadastrados
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Endereco>> listarTodos() {
        return ResponseEntity.ok(enderecoService.listarTodos());
    }

    /**
     * Usuário comum: Pode visualizar apenas seus próprios endereços (Admin pode ver de qualquer um)
     */
    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("@securityService.isMesmoUsuarioOuAdmin(#usuarioId)")
    public ResponseEntity<List<Endereco>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(enderecoService.listarPorUsuario(usuarioId));
    }

    /**
     * Cadastrar endereço: Admin pode cadastrar para qualquer um, usuário comum apenas para si mesmo
     */
    @PostMapping
    public ResponseEntity<Endereco> criar(@RequestBody Endereco endereco) {
        if (endereco.getUsuario() == null || endereco.getUsuario().getId() == null) {
            throw new IllegalArgumentException("Usuário é obrigatório para cadastrar um endereço.");
        }
        if (!securityService.isMesmoUsuarioOuAdmin(endereco.getUsuario().getId())) {
            throw new AccessDeniedException("Você não tem permissão para cadastrar endereço para outro usuário.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(enderecoService.criarEndereco(endereco));
    }

    /**
     * Editar endereço: Admin pode editar qualquer um, usuário comum apenas seus próprios endereços
     */
    @PutMapping("/{id}")
    @PreAuthorize("@securityService.isDonoDoEnderecoOuAdmin(#id)")
    public ResponseEntity<Endereco> atualizar(@PathVariable Long id, @RequestBody Endereco endereco) {
        return ResponseEntity.ok(enderecoService.atualizarEndereco(id, endereco));
    }

    /**
     * Definir como principal: Admin ou dono do endereço
     */
    @PatchMapping("/{id}/principal")
    @PreAuthorize("@securityService.isDonoDoEnderecoOuAdmin(#id)")
    public ResponseEntity<Void> definirComoPrincipal(@PathVariable Long id) {
        enderecoService.definirComoPrincipal(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Excluir endereço: Admin ou dono do endereço
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.isDonoDoEnderecoOuAdmin(#id)")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        enderecoService.deletarEndereco(id);
        return ResponseEntity.noContent().build();
    }
}

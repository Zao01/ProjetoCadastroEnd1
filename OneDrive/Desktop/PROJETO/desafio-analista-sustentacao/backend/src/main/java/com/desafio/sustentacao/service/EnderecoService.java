package com.desafio.sustentacao.service;

import com.desafio.sustentacao.dto.ViaCepDTO;
import com.desafio.sustentacao.entity.Endereco;
import com.desafio.sustentacao.entity.Usuario;
import com.desafio.sustentacao.repository.EnderecoRepository;
import com.desafio.sustentacao.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Consulta CEP externo (ViaCEP) com suporte a Cache em memória
     */
    @Cacheable(value = "ceps", key = "#cep")
    public ViaCepDTO consultarCep(String cep) {
        String cepLimpo = cep.replaceAll("\\D", "");
        String url = "https://viacep.com.br/ws/" + cepLimpo + "/json/";
        try {
            return restTemplate.getForObject(url, ViaCepDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao consultar CEP na API ViaCEP.");
        }
    }

    /**
     * Cadastra múltiplos endereços para o usuário
     */
    @Transactional
    @SuppressWarnings("null")
    public Endereco criarEndereco(Endereco endereco) {
        if (endereco.getUsuario() == null || endereco.getUsuario().getId() == null) {
            throw new RuntimeException("Usuário é obrigatório para cadastrar um endereço.");
        }

        Long usuarioId = endereco.getUsuario().getId();
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // Se os dados do endereço vierem vazios, busca e preenche via ViaCEP
        if (endereco.getLogradouro() == null || endereco.getLogradouro().isBlank()) {
            ViaCepDTO viaCep = consultarCep(endereco.getCep());
            if (viaCep != null && !Boolean.TRUE.equals(viaCep.getErro())) {
                endereco.setLogradouro(viaCep.getLogradouro());
                endereco.setBairro(viaCep.getBairro());
                endereco.setCidade(viaCep.getLocalidade());
                endereco.setEstado(viaCep.getUf());
            }
        }

        List<Endereco> enderecosExistentes = enderecoRepository.findByUsuarioId(usuarioId);

        // Regra 1: Se for o primeiro endereço, define obrigatoriamente como Principal
        if (enderecosExistentes.isEmpty()) {
            endereco.setIsPrincipal(true);
        } else if (Boolean.TRUE.equals(endereco.getIsPrincipal())) {
            // Regra 2: Se marcou o novo endereço como principal, desmarca os anteriores
            desmarcarPrincipaisDoUsuario(usuarioId);
        } else {
            endereco.setIsPrincipal(false);
        }

        endereco.setUsuario(usuario);
        return enderecoRepository.save(endereco);
    }

    public List<Endereco> listarTodos() {
        return enderecoRepository.findAll();
    }

    public List<Endereco> listarPorUsuario(Long usuarioId) {
        return enderecoRepository.findByUsuarioId(usuarioId);
    }

    @SuppressWarnings("null")
    public Endereco buscarPorId(Long id) {
        return enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado."));
    }

    /**
     * Atualiza dados de um endereço existente
     */
    @Transactional
    @SuppressWarnings("null")
    public Endereco atualizarEndereco(Long id, Endereco dados) {
        Endereco endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado."));

        if (dados.getCep() != null && !dados.getCep().isBlank()) {
            endereco.setCep(dados.getCep());
        }
        if (dados.getNumero() != null && !dados.getNumero().isBlank()) {
            endereco.setNumero(dados.getNumero());
        }
        if (dados.getComplemento() != null) {
            endereco.setComplemento(dados.getComplemento());
        }

        if (dados.getLogradouro() != null && !dados.getLogradouro().isBlank()) {
            endereco.setLogradouro(dados.getLogradouro());
            endereco.setBairro(dados.getBairro());
            endereco.setCidade(dados.getCidade());
            endereco.setEstado(dados.getEstado());
        } else if (dados.getCep() != null && !dados.getCep().isBlank()) {
            ViaCepDTO viaCep = consultarCep(dados.getCep());
            if (viaCep != null && !Boolean.TRUE.equals(viaCep.getErro())) {
                endereco.setLogradouro(viaCep.getLogradouro());
                endereco.setBairro(viaCep.getBairro());
                endereco.setCidade(viaCep.getLocalidade());
                endereco.setEstado(viaCep.getUf());
            }
        }

        return enderecoRepository.save(endereco);
    }

    /**
     * Define manualmente um endereço existente como Principal
     */
    @Transactional
    @SuppressWarnings("null")
    public void definirComoPrincipal(Long enderecoId) {
        Endereco endereco = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado."));

        Long usuarioId = endereco.getUsuario().getId();

        desmarcarPrincipaisDoUsuario(usuarioId);

        endereco.setIsPrincipal(true);
        enderecoRepository.save(endereco);
    }

    /**
     * Exclui um endereço e reelege o principal se o excluído for o ativo
     */
    @Transactional
    @SuppressWarnings("null")
    public void deletarEndereco(Long enderecoId) {
        Endereco endereco = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado."));

        Long usuarioId = endereco.getUsuario().getId();
        boolean eraPrincipal = Boolean.TRUE.equals(endereco.getIsPrincipal());

        enderecoRepository.delete(endereco);

        // Se o excluído era principal, elege o próximo da fila como novo principal
        if (eraPrincipal) {
            List<Endereco> restantes = enderecoRepository.findByUsuarioId(usuarioId);
            if (!restantes.isEmpty()) {
                Endereco novoPrincipal = restantes.get(0);
                novoPrincipal.setIsPrincipal(true);
                enderecoRepository.save(novoPrincipal);
            }
        }
    }

    /**
     * Método auxiliar para remover a flag principal de todos os endereços do
     * usuário
     */
    private void desmarcarPrincipaisDoUsuario(Long usuarioId) {
        List<Endereco> enderecos = enderecoRepository.findByUsuarioId(usuarioId);
        for (Endereco end : enderecos) {
            if (Boolean.TRUE.equals(end.getIsPrincipal())) {
                end.setIsPrincipal(false);
                enderecoRepository.save(end);
            }
        }
    }
}
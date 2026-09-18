package com.desafio.sustentacao.service;

import com.desafio.sustentacao.dto.ViaCepResponseDTO;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ViaCepService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Cacheable(value = "ceps", key = "#cep")
    public ViaCepResponseDTO buscarCep(String cep) {
        String cepLimpo = cep.replaceAll("\\D", "");
        String url = "https://viacep.com.br/ws/" + cepLimpo + "/json/";

        try {
            ViaCepResponseDTO response = restTemplate.getForObject(url, ViaCepResponseDTO.class);
            if (response == null || Boolean.TRUE.equals(response.getErro())) {
                throw new IllegalArgumentException("CEP não encontrado no ViaCEP");
            }
            return response;
        } catch (Exception e) {
            throw new IllegalArgumentException("Erro ao consultar CEP: " + e.getMessage());
        }
    }
}
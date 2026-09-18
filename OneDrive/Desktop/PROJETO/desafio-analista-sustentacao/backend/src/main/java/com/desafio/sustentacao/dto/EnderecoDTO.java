package com.desafio.sustentacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class EnderecoDTO {
    private Long id;

    @NotBlank(message = "O CEP é obrigatório")
    @Pattern(regexp = "^\\d{5}-?\\d{3}$", message = "Formato de CEP inválido")
    private String cep;

    private String logradouro;
    private String bairro;
    private String cidade;
    private String estado;

    @NotBlank(message = "O número é obrigatório")
    private String numero;

    private String complemento;
    private Boolean isPrincipal = false;
    private Long usuarioId;
}
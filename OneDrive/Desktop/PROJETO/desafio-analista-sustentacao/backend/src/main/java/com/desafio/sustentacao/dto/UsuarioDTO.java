package com.desafio.sustentacao.dto;

import com.desafio.sustentacao.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UsuarioDTO {
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotBlank(message = "O CPF é obrigatório")
    @Pattern(regexp = "(^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$)|(^\\d{11}$)", message = "Formato de CPF inválido")
    private String cpf;

    private LocalDate dataNascimento;

    @NotBlank(message = "A senha é obrigatória")
    private String senha;

    private Role role;
}
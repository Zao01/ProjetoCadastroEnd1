package com.desafio.sustentacao.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "enderecos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 9)
    private String cep;

    private String logradouro;
    private String bairro;
    private String cidade;
    private String estado;

    @Column(nullable = false)
    private String numero;

    private String complemento;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isPrincipal = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"enderecos", "senha", "hibernateLazyInitializer", "handler"})
    private Usuario usuario;
}
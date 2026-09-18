package com.desafio.sustentacao.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Claims claims = jwtService.getClaims(token);
                String cpf = claims.getSubject();
                String role = claims.get("role", String.class);
                Object idObj = claims.get("id");
                Long usuarioId = null;
                if (idObj instanceof Number number) {
                    usuarioId = number.longValue();
                } else if (idObj != null) {
                    try {
                        usuarioId = Long.parseLong(idObj.toString());
                    } catch (NumberFormatException ignored) {}
                }

                if (cpf != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Garante que o prefixo ROLE_ esteja presente nas autoridades
                    String authorityName = (role != null && role.startsWith("ROLE_")) ? role : "ROLE_" + role;
                    List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(authorityName));
                    UsuarioPrincipal principal = new UsuarioPrincipal(usuarioId, cpf, authorities);

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            authorities);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                // Token inválido ou expirado
            }
        }

        filterChain.doFilter(request, response);
    }
}
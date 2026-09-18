# 🚀 Projeto Cadastro & Gestão de Endereços

Uma aplicação web **Full-Stack** desenvolvida como teste técnico para a posição de Analista de Sustentação / Desenvolvedor. O sistema conta com autenticação segura via JWT, controlo de acesso por perfis (RBAC), gestão de múltiplos endereços com integração automática ao ViaCEP, interface moderna responsiva e script de inicialização simultânea.

---

## 🎨 Interface, UX & Responsividade

A interface do projeto foi desenvolvida com foco em **UX (User Experience)** e ergonomia visual, adaptando-se perfeitamente a computadores, tablets e smartphones:

- **Design System:** Inspirado em painéis administrativos modernos com o tema *Clean Soft Light/Dark*.
- **Tipografia:** `Inter` para leitura fluida de dados e `Poppins` para cabeçalhos e destaques.
- **Responsividade Total:** Layout adaptável via Media Queries, com grelhas (*grids*) fluidas, tabelas com scroll horizontal em telas menores e botões ajustados para toque mobile.

---

## ✨ Funcionalidades Principais

### 🔐 Autenticação & Segurança (RBAC)
- **Login com JWT:** Geração e validação de tokens Bearer para proteger as rotas da API.
- **Proteção de Dados Sensíveis:** Ocultação de senhas na API com `@JsonProperty(access = WRITE_ONLY)` e uso de variáveis de ambiente para credenciais de banco e segredos JWT.
- **Perfis de Acesso:**
  - `ROLE_USUARIO`: Acesso ao perfil pessoal e gestão dos seus próprios endereços.
  - `ROLE_ADMIN`: Acesso ao painel administrativo completo para listagem e cadastro de novos utilizadores.
- **Cadastro Público:** Permite o registo inicial de novos utilizadores na plataforma.

### 📍 Gestão de Endereços & ViaCEP
- **Consulta Automática:** Preenchimento automático de logradouro, bairro, cidade e UF ao digitar o CEP.
- **Suporte a Cache:** Consultas de CEP armazenadas em memória no backend (`@Cacheable`) para otimizar o tempo de resposta e reduzir chamadas externas.
- **Múltiplos Endereços:** Cada utilizador pode registar e gerir vários endereços sem limite.
- **Regras de Endereço Principal:**
  - O primeiro endereço registado torna-se obrigatoriamente o **Principal**.
  - Alternância simples para escolher outro endereço como principal.
  - Reeleição automática de um novo endereço principal caso o ativo seja eliminado.

---

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **Java 17 / Spring Boot 3**
- **Spring Security** (Autenticação JWT, encriptação BCrypt e CORS liberado)
- **Spring Data JPA / Hibernate**
- **Banco de Dados H2** (Em memória com suporte a variáveis de ambiente)
- **Lombok**
- **RestTemplate / Spring Cache**

### **Frontend**
- **React.js** (Vite)
- **React Router DOM** (Navegação SPA)
- **Axios** (Com Interceptors para anexar automaticamente o Token JWT)
- **CSS Modules & Global Styles** (Com Media Queries para Mobile)

### **DevOps & Ferramentas**
- **Concurrently:** Execução simultânea de backend e frontend num único comando.
- **Ngrok:** Suporte a tunelamento público para testes em dispositivos externos.

---

## 📂 Estrutura do Projeto

```text
ProjetoCadastroEnd1/
├── package.json             # Script principal (start unificado com concurrently)
├── .gitignore               # Bloqueio de arquivos sensíveis, node_modules e binaries
├── backend/
│   ├── src/main/java/com/desafio/sustentacao/
│   │   ├── controller/      # Controllers da API (Auth, Usuario, Endereco)
│   │   ├── dto/             # Objetos de Transferência de Dados
│   │   ├── entity/          # Entidades JPA (Usuario, Endereco)
│   │   ├── repository/      # Interfaces Spring Data JPA
│   │   ├── security/        # Filtro JWT, JwtService e SecurityConfig
│   │   └── service/         # Regras de negócio e integração ViaCEP
│   └── src/main/resources/  # application.yml (com variáveis de ambiente)
│
└── frontend/
    ├── vite.config.js       # Configuração do Vite (com suporte a host Ngrok)
    ├── src/
    │   ├── components/      # Componentes reutilizáveis (FormEndereco)
    │   ├── pages/           # Páginas (Login, Cadastro, Perfil, Admin)
    │   ├── services/        # Instância e interceptores do Axios (api.js)
    │   └── styles/          # Estilos CSS responsivos (global, perfil, admin)
    └── index.css            # Ponto central de importação de estilos
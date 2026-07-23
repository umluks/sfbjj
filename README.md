# SFBJJ - Sistema de Gestão de Academia de Jiu-Jitsu

O **SFBJJ** é um sistema moderno de gestão interna desenvolvido sob medida para academias de Jiu-Jitsu (especialmente a **Sagrada Família Brasília Jiu-Jitsu**). A aplicação facilita a administração de alunos, controle financeiro, emissão de diplomas de graduação em PDF, controle de presenças/frequência, consulta ao currículo de técnicas, visualização de grades de horários e acompanhamento de perfis individuais de atletas (graduação com tempo na faixa, frequência, pagamentos e dados cadastrais).

Esta aplicação foi configurada como uma **Progressive Web App (PWA)** totalmente instalável e otimizada para uso em dispositivos móveis e desktops, contando com suporte a funcionamento offline, notificações de rede e avisos in-app.

---

## 🚀 Funcionalidades Principais

O sistema possui um layout 100% responsivo, controle de acesso baseado em três perfis de usuários principais (**Administrador**, **Professor** e **Aluno**) e foco em usabilidade moderna (UX/UI):

### 👤 Autenticação e Segurança
- **Login Híbrido com Máscara de CPF:** A tela de login permite a autenticação por e-mail ou CPF. Ao digitar apenas números, o sistema aplica automaticamente a máscara `000.000.000-00` de forma dinâmica e limpa, adaptando a entrada do usuário para evitar erros de preenchimento.

### 📐 Layout e Navegação
- **Menu Lateral Esquerdo Colapsável:** Painel de navegação moderno que pode ser recolhido para maximizar a área de trabalho (especialmente útil para visualização de dashboards e tabelas financeiras complexas). Conta com tooltips automáticos no estado colapsado, transições fluidas de largura (`transition-all`) e acessibilidade completa via leitor de telas (`aria-label`).

### 👤 Perfil Administrador (Admin)
- **Painel Geral (Dashboard):** Visualização de estatísticas rápidas da academia, exibição cronológica de todos os aniversariantes do mês com destaque visual e animação suave (`soft-blink`) para o aniversariante do dia, e publicação de avisos ou comunicados internos.
- **Gestão de Alunos:** Cadastro completo de atletas (Kids e Adulto), edição de informações, busca e filtros avançados por status, graduação ou turma, suporte para exportar a listagem em formato CSV/Excel, e visualização detalhada do histórico de graduações calculando dinamicamente o tempo gasto em cada faixa (**Tempo na Faixa**).
- **Graduação em Lote & Diplomas:** Promoção em massa de alunos por turma ou graduação e geração instantânea de diplomas de graduação oficiais em formato PDF (download individual ou empacotado em arquivo ZIP).
- **Configuração de Diplomas:** Customização visual dos diplomas de graduação, incluindo upload de imagem de fundo (template), assinatura digital dos professores/mestres e personalização de textos de cabeçalho, corpo e data.
- **Relatório de Frequência:** Painel analítico de presenças e assiduidade dos alunos por turma, aula e período.
- **Currículo de Técnicas:** Gerenciamento da biblioteca de posições e técnicas da semana divididas por público (Kids, Adulto, Geral) e classificação (Guarda, Passagem, Raspagem, Finalização, Queda, Defesa, Outros) com integração de vídeos demonstrativos.
- **Gestão de Equipe (Staff):** Controle completo do quadro de professores e administradores da academia em uma única interface unificada (CRUD), com suporte a campos adicionais (como registro CBJJ, foto de perfil e assinatura digital).
- **Controle Financeiro:** Gerenciamento de faturamento mensal, fluxo de caixa detalhado, controle de mensalidades pagas e pendentes, e saldo acumulado com transição automática de saldos de meses anteriores.
- **Grade de Horários:** Visualização e gerenciamento completo da programação de aulas semanais e turmas.

### 🎓 Perfil Professor (Teacher)
- **Consultar Alunos:** Acesso rápido à listagem de alunos para acompanhamento das turmas.
- **Relatório de Frequência:** Consulta de presenças e histórico de assiduidade dos atletas nas aulas.
- **Currículo de Técnicas:** Acesso à biblioteca técnica e vídeos de referência para instrução das turmas.
- **Grade de Horários:** Visualização completa da programação de aulas semanais.
- **Suporte:** Acesso direto aos canais de comunicação interna.

### 🥋 Perfil Aluno (Student)
- **Perfil do Atleta (Meu Perfil):** Dados cadastrais, alteração de senha e visualização de status de pagamentos.
- **Minha Jornada:** Seção dedicada ao acompanhamento do desenvolvimento técnico do atleta com estatísticas de tempo de prática, horas acumuladas, sequência de treinos (streak de dias), total de treinos registrados e progresso da meta mensal com anel circular de progresso.
  - **Linha do Tempo de Graduações (Timeline):** Integrada diretamente na página da Jornada, exibe em destaque a trajetória completa de graduações (faixas e graus) com o cálculo automático do **Tempo de Permanência na Faixa** entre cada promoção até o dia atual na faixa ativa.
- **Minha Frequência:** Realização de check-in em tempo real em aulas abertas e histórico detalhado de presenças. Possibilita desmarcar presenças de aulas abertas com botão dinâmico ou exclusão direta no histórico.
- **Currículo de Técnicas:** Consulta de técnicas da semana e vídeos tutoriais cadastrados pelos professores.
- **Grade de Horários:** Consulta de horários de aulas e turmas ativas.
- **Contato & Suporte:** Acesso à localização física da academia integrada com mapa e formulário para contato direto.

### 📱 Recursos PWA (Progressive Web App)
- **Instalação Facilitada:** Botão "Instalar Aplicativo" integrado à barra de navegação superior, seção Hero da Landing Page e rodapé da barra lateral interna (disponível para Desktop e Android).
- **Compatibilidade com iOS:** Modal dinâmico instrutivo que guia o usuário a adicionar o aplicativo à tela de início a partir do Safari no iPhone/iPad.
- **Suporte Offline:** A aplicação permanece funcional mesmo sem conexão de internet (servindo recursos em cache via Service Worker). Um banner vermelho no topo da interface alerta quando o aplicativo está operando offline.
- **Tela Offline Customizada:** Exibição de uma tela offline amigável e estilizada (`offline.html`) caso o usuário acesse o app sem conexão e sem recursos previamente armazenados no cache.
- **Notificações Push / In-App:** Integração com a API de Notificações do navegador para avisar os usuários sobre novos comunicados cadastrados.

---

## 🛠️ Tecnologias Utilizadas

A aplicação foi construída utilizando ferramentas modernas do ecossistema Web:

- **Frontend Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Ferramenta de Build & Bundler:** [Vite 8](https://vite.dev/)
- **Backend as a Service (BaaS):** [Supabase](https://supabase.com/) (Banco de dados PostgreSQL, Autenticação e Armazenamento)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + PostCSS + Autoprefixer
- **Geração de PDF & Arquivos:** [jsPDF](https://github.com/parallax/jsPDF) (geração de diplomas) + [JSZip](https://stuk.github.io/jszip/) (compactação de lote)
- **Ferramenta PWA:** [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) (geração e automação de Service Worker e Web Manifest)
- **Biblioteca de Ícones:** [Lucide React](https://lucide.dev/)
- **Servidor Web & Proxy de Produção:** [Nginx](https://www.nginx.com/)
- **Containerização:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 📦 Como Executar o Projeto

Você pode rodar este projeto de três formas: **desenvolvimento frontend isolado**, **integrado com o Supabase local** ou via **Docker** para simular o ambiente de produção.

### 1. Executando o Frontend Localmente (Desenvolvimento)

#### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) (versão 20 ou superior recomendada) e o `npm` instalados em sua máquina.

##### Passo a Passo
1. Instale as dependências necessárias:
   ```bash
   npm install
   ```
2. Crie e configure o arquivo `.env` na raiz do projeto utilizando as credenciais do seu projeto Supabase:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
   ```
3. Inicie o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
4. Abra o navegador no endereço indicado no terminal (geralmente [http://localhost:5173](http://localhost:5173)).

---

### 2. Gerenciando o Backend Localmente (Supabase CLI)

O projeto possui o executável do Supabase CLI (`supabase.exe`) integrado para facilitar o desenvolvimento local com banco de dados PostgreSQL e migrações.

> [!TIP]
> **Aviso para usuários de Windows rodando o Git Bash:**
> A barra invertida (`\`) é interpretada como caractere de escape no Git Bash. Por isso, para executar comandos do Supabase localmente por ele, utilize a barra normal `/` (ex: `./supabase.exe db reset` em vez de `.\supabase.exe db reset`).

#### Pré-requisitos
Ter o Docker rodando em sua máquina (necessário para subir os containers locais do Supabase).

#### Comandos Úteis do Supabase Local
Para interagir com o backend local do Supabase usando o executável do repositório:

- **Iniciar o Supabase local:**
  ```powershell
  .\supabase start
  ```
  *Isso iniciará os containers locais do PostgreSQL, Auth, Storage, Studio, etc. Ao finalizar, serão fornecidas as credenciais locais (URL, Anon Key) e a URL do painel administrativo local (geralmente `http://localhost:54321`).*

- **Parar o Supabase local:**
  ```powershell
  .\supabase stop
  ```

- **Resetar o banco de dados e aplicar migrações:**
  ```powershell
  .\supabase db reset
  ```
  *Este comando remove todos os dados locais e reexecuta todas as migrações presentes na pasta `supabase/migrations` na ordem correta.*

- **Verificar o status dos serviços:**
  ```powershell
  .\supabase status
  ```

- **Criar uma nova migração:**
  ```powershell
  .\supabase migration new nome_da_migracao
  ```

#### Estrutura de Migrações do Banco
As migrações SQL na pasta `supabase/migrations/` definem o schema do banco de dados local:
1. `00_esquema_inicial.sql`: Tabelas e estruturas base do sistema (alunos, pagamentos, aulas e avisos) com RLS ativado.
2. `01_novas_funcionalidades.sql`: Tabelas adicionais para gerenciamento de graduações, histórico e professores.
3. `02_graduacoes_lote.sql`: Funções e triggers PostgreSQL para atualização de graduações de alunos em lote.
4. `03_administradores.sql`: Tabela de administradores para acesso de gestão e chaves estrangeiras.
5. `04_separacao_tabelas.sql`: Separação lógica de tabelas, limpeza de campos obsoletos e redefinição de relações.
6. `05_melhorias_integridade.sql`: Restrições de validação (`CHECK`), chaves estrangeiras pendentes e índices de performance para otimizar JOINs e buscas.
7. `06_foto_e_cbjj_professor.sql`: Adiciona suporte para foto de perfil (`foto_perfil`) e número de registro CBJJ (`cbjj`) na tabela de professores.
8. `07_ajuste_categorias_grade.sql`: Padronização de categorias existentes de aulas e turmas (`Kids` e `Adulto`).
9. `08_cria_tabela_turmas.sql`: Criação da tabela dedicada de turmas, com RLS habilitado e vinculação de integridade na tabela de aulas.
10. `09_controle_frequencia.sql`: Criação da tabela `frequencias` para registro de presenças e check-in dos alunos com restrição única por aluno/aula/data.
11. `10_curriculo_e_rls.sql`: Tabela `tecnicas` para gestão do currículo da semana (categoria, classificação e vídeo) e refinamento de políticas RLS em alunos, pagamentos e frequências.
12. `11_diplomas_template.sql`: Coluna de assinatura digital na tabela de professores e criação da tabela `configuracoes_diploma` para modelos de certificados.
13. `12_diplomas_custom_text.sql`: Suporte a textos e prefixos de data customizáveis na emissão de diplomas de graduação.

---

### 3. Executando via Docker (Produção/Homologação)

O projeto possui suporte nativo para build em múltiplos estágios (Multi-stage build) com Nginx configurado para lidar com o roteamento SPA (Single Page Application).

#### Pré-requisitos
Certifique-se de ter o [Docker](https://www.docker.com/) e o [Docker Compose](https://docs.docker.com/compose/) instalados e rodando em sua máquina.

#### Opção A: Utilizando Docker Compose (Recomendado)
1. Na raiz do projeto, execute o comando:
   ```bash
   docker compose up -d --build
   ```
2. O projeto será compilado e servido automaticamente na porta **8080**.
3. Acesse em seu navegador: [http://localhost:8080](http://localhost:8080)

Para parar os serviços, utilize:
```bash
docker compose down
```

#### Opção B: Utilizando comandos Docker diretamente
1. Construa a imagem Docker:
   ```bash
   docker build -t sfbjj-app .
   ```
2. Inicie o container mapeando a porta local 8080 para a porta 80 do container:
   ```bash
   docker run -d -p 8080:80 --name sfbjj_container sfbjj-app
   ```
3. Acesse a aplicação em: [http://localhost:8080](http://localhost:8080)

> [!NOTE]
> Para que os recursos de PWA (instalação e service worker) funcionem plenamente no navegador fora do ambiente de desenvolvimento local (`localhost`), a aplicação deve ser servida obrigatoriamente através do protocolo seguro **HTTPS**.

---

## 🔄 Integração Contínua & Deploy (CI/CD)

O projeto conta com automações de deploy via **GitHub Actions** configuradas no diretório `.github/workflows/`. Os deploys são disparados sempre que alterações são integradas à branch principal de produção: **`production-hostgator`**.

### 1. Deploy Automatizado na HostGator (via FTP)
Configurado no arquivo [`deploy-hostgator.yaml`](file:///.github/workflows/deploy-hostgator.yaml), este fluxo faz o build do projeto para produção e envia os arquivos gerados no diretório `dist/` para a hospedagem HostGator.

Para que funcione corretamente, configure as seguintes variáveis no GitHub (em *Settings > Secrets and variables > Actions*):
- `FTP_HOST`: Endereço do servidor FTP da HostGator.
- `FTP_USER`: Usuário de acesso ao FTP.
- `FTP_PASS`: Senha do usuário de FTP.

### 2. Build e Publicação de Imagem Docker (Docker Hub)
Configurado no arquivo [`deploy-dockerhub.yaml`](file:///.github/workflows/deploy-dockerhub.yaml), este fluxo compila a imagem Docker e a publica no Docker Hub com suporte multi-plataforma e cache avançado. 

As tags geradas no Docker Hub (`umluks/sfbjj`) são:
- `latest`: Contém a versão mais recente compilada da branch `production-hostgator`.
- `1.0.X`: Versão incremental gerada automaticamente a partir do número da execução (`github.run_number`).

Para que funcione, configure os seguintes segredos no repositório GitHub:
- `DOCKERHUB_USERNAME`: Nome de usuário da sua conta Docker Hub.
- `DOCKERHUB_TOKEN`: Token de acesso pessoal gerado no console do Docker Hub.

---

## 📂 Estrutura de Pastas

O projeto adota uma arquitetura em camadas baseada em princípios de **Clean Architecture** (Arquitetura Limpa), separando responsabilidades e facilitando testes e manutenção:

```text
sfbjj/
├── .github/                # Configurações do GitHub e fluxos de CI/CD (Workflows)
│   └── workflows/          # Arquivos yaml de automação de Deploy (HostGator e Docker Hub)
├── public/                 # Arquivos estáticos (ícones do PWA, offline.html, favicon, logos)
├── src/
│   ├── application/        # Regras de aplicação e lógica de fluxo de dados (Use Cases, Hooks, Contexts, Services)
│   │   ├── contexts/       # Contextos globais do React (ex: Autenticação, Estado de Alunos)
│   │   ├── hooks/          # Hooks customizados (ex: gerenciamento de horários, anúncios e PWA)
│   │   └── services/       # Serviços de aplicação (ex: diplomaService, announcementService)
│   ├── assets/             # Imagens e mídias estáticas do sistema
│   ├── constants/          # Constantes globais (ex: graduações, regras de faixas)
│   ├── domain/             # Núcleo de domínio da aplicação (independente de frameworks e APIs)
│   │   ├── models/         # Definições e modelos de dados (Aluno, Professor, Pagamento, etc.)
│   │   └── repositories/   # Definições de contratos (interfaces) de Repositórios
│   ├── infrastructure/     # Detalhes de infraestrutura e serviços externos
│   │   ├── lib/            # Clientes externos configurados (ex: Supabase Client)
│   │   └── repositories/   # Implementações concretas das interfaces de repositório (Supabase)
│   ├── presentation/       # Componentes de interface com o usuário (UI) e controle de estado visual
│   │   ├── components/     # Componentes visuais reutilizáveis organizados por contexto (financeiro, alunos, etc.)
│   │   ├── layouts/        # Layouts de estrutura de página (MainLayout)
│   │   └── pages/          # Páginas inteiras da aplicação (Dashboard, Students, BatchGraduation, etc.)
│   ├── utils/              # Funções utilitárias auxiliares e formatadores genéricos
│   ├── App.tsx             # Componente raiz do React, gerencia o roteamento principal
│   ├── index.css           # Folha de estilos globais e animações Tailwind CSS
│   └── main.tsx            # Ponto de entrada da aplicação
├── supabase/               # Configurações do backend Supabase
│   ├── migrations/         # Arquivos de migração de banco de dados SQL (00 a 12)
│   └── config.toml         # Configuração de portas e comportamento do Supabase CLI
├── Dockerfile              # Dockerfile multi-stage com compilação e servidor Nginx
├── docker-compose.yml      # Manifesto de composição de containers de produção
├── nginx.conf              # Configuração do Nginx para servir arquivos SPA no Docker
├── supabase.exe            # Binário local do Supabase CLI (para ambiente Windows)
└── package.json            # Manifesto de dependências, metadados e scripts de execução
```

---

## 📜 Licença

Este projeto está sob a licença [MIT](LICENSE). Consulte o arquivo `LICENSE` para obter mais detalhes.

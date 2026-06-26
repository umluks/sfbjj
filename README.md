# SFBJJ - Sistema de Gestão de Academia de Jiu-Jitsu

O **SFBJJ** é um sistema moderno de gestão interna desenvolvido sob medida para academias de Jiu-Jitsu (especialmente a **Sagrada Família Brasília Jiu-Jitsu**). A aplicação facilita a administração de alunos, controle financeiro, visualização de grades de horários, acompanhamento de perfis individuais de atletas (graduação, frequência, pagamentos e dados cadastrais) e muito mais.

Esta aplicação foi configurada como uma **Progressive Web App (PWA)** totalmente instalável e otimizada para uso em dispositivos móveis e desktops, contando com suporte a funcionamento offline e notificações de rede.

---

## 🚀 Funcionalidades Principais

O sistema possui um layout 100% responsivo e controle de acesso baseado em três perfis de usuários principais (**Administrador**, **Professor** e **Aluno**):

### 👤 Perfil Administrador (Admin)
- **Painel Geral (Dashboard):** Visualização de estatísticas rápidas da academia, destaque em tempo real para os aniversariantes do dia e publicação de avisos ou comunicados internos.
- **Gestão de Alunos:** Cadastro completo de atletas (Kids e Adulto), edição de informações, busca e filtros avançados por status, graduação ou turma, além de suporte para exportar a listagem em formato CSV/Excel.
- **Gestão de Professores:** Controle do quadro de professores da academia.
- **Controle Financeiro:** Gerenciamento de faturamento mensal, fluxo de caixa detalhado, controle de mensalidades pagas e pendentes, e saldo acumulado com transição automática de saldos de meses anteriores.
- **Grade de Horários:** Visualização completa da programação de aulas semanais.

### 🎓 Perfil Professor (Teacher)
- **Consultar Alunos:** Acesso rápido à listagem de alunos para acompanhamento das turmas.
- **Grade de Horários:** Visualização completa da programação de aulas semanais.
- **Suporte:** Acesso direto aos canais de comunicação interna.

### 🥋 Perfil Aluno (Student)
- **Perfil do Atleta:** Histórico completo de graduações, datas de exames de faixa, dados cadastrais e visualização do status de pagamentos.
- **Grade de Horários:** Consulta de horários de aulas e turmas ativas.
- **Contato & Suporte:** Acesso à localização física da academia integrada com mapa e formulário para contato direto.

### 📱 Recursos PWA (Progressive Web App)
- **Instalação Facilitada:** Botão "Instalar Aplicativo" integrado à barra de navegação superior, seção Hero da Landing Page e rodapé da barra lateral interna (disponível para Desktop e Android).
- **Compatibilidade com iOS:** Modal dinâmico instrutivo que guia o usuário a adicionar o aplicativo à tela de início a partir do Safari no iPhone/iPad.
- **Suporte Offline:** A aplicação permanece funcional mesmo sem conexão de internet (servindo recursos em cache via Service Worker). Um banner vermelho no topo da interface alerta quando o aplicativo está operando offline.
- **Tela Offline Customizada:** Exibição de uma tela offline amigável e estilizada caso o usuário acesse o app sem conexão e sem recursos previamente armazenados no cache.

---

## 🛠️ Tecnologias Utilizadas

A aplicação foi construída utilizando ferramentas modernas do ecossistema Web:

- **Frontend Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Ferramenta de Build & Bundler:** [Vite](https://vite.dev/)
- **Backend as a Service (BaaS):** [Supabase](https://supabase.com/) (Banco de dados PostgreSQL, Autenticação e Armazenamento)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Ferramenta PWA:** [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) (para geração e automação do Service Worker e do Web Manifest)
- **Biblioteca de Ícones:** [Lucide React](https://lucide.dev/)
- **Servidor Web & Proxy de Produção:** [Nginx](https://www.nginx.com/)
- **Containerização:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 📦 Como Executar o Projeto

Você pode rodar este projeto de três formas: **desenvolvimento frontend isolado**, **integrado com o Supabase local** ou via **Docker** para simular o ambiente de produção.

### 1. Executando o Frontend Localmente (Desenvolvimento)

#### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) (versão 20 ou superior recomendada) e o `npm` instalados em sua máquina.

#### Passo a Passo
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
1. `01_novas_funcionalidades.sql`: Tabelas e relacionamentos iniciais (ex: alunos, turmas).
2. `02_graduacoes_lote.sql`: Funções para atualização de graduações em lote.
3. `03_administradores.sql`: Tabela de administradores e chaves estrangeiras.
4. `04_separacao_tabelas.sql`: Ajustes na separação de tabelas e definição de tipos de dados.

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

```text
sfbjj/
├── .github/                # Configurações do GitHub e fluxos de CI/CD (Workflows)
│   └── workflows/          # Arquivos yaml de automação de Deploy (HostGator e Docker Hub)
├── public/                 # Arquivos estáticos (ícones do PWA, offline.html, favicon, logos)
├── src/
│   ├── assets/             # Imagens e mídias estáticas do sistema
│   ├── components/         # Componentes React (Painéis de controle, Login, Modais e Landing Page)
│   ├── hooks/              # Hooks customizados (Ex: usePWAInstall para fluxo do PWA)
│   ├── types/              # Definições de tipagem global TypeScript
│   ├── mockData.ts         # Dados fictícios para simulação de fluxo (alunos, pagamentos, avisos)
│   ├── App.tsx             # Componente raiz do React, gerencia estados principais e rotas simples
│   └── main.tsx            # Ponto de entrada da aplicação
├── supabase/               # Configurações do backend Supabase
│   ├── migrations/         # Arquivos de migração de banco de dados SQL
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

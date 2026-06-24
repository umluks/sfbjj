# SFBJJ - Sistema de Gestão de Academia de Jiu-Jitsu

O **SFBJJ** é um sistema moderno e completo de gestão interna desenvolvido para academias de Jiu-Jitsu. A aplicação foi projetada para facilitar a administração de alunos, controle financeiro, visualização de grades de horários, acompanhamento de perfis individuais de atletas (graduação, frequência, pagamentos e dados cadastrais) e muito mais.

Esta aplicação foi transformada em uma **Progressive Web App (PWA)** totalmente instalável e pronta para uso em dispositivos móveis e desktop, contando com suporte a funcionamento offline e notificações de rede.

---

## 🚀 Funcionalidades Principais

A aplicação possui um layout 100% responsivo para mobile e desktop, com controle de acesso para três perfis de usuários principais (**Administrador**, **Professor** e **Aluno**):

### 👤 Perfil Administrador (Admin)
- **Painel Geral (Dashboard):** Visualização de estatísticas rápidas da academia, destaque em tempo real para os aniversariantes do dia e publicação de avisos/comunicados internos.
- **Gestão de Alunos:** Cadastro completo de atletas (Kids e Adulto), edição de informações, busca e filtros avançados por status, graduação ou turma, além de suporte para exportar a listagem em formato CSV/Excel.
- **Gestão de Professores:** Controle do quadro de professores da academia.
- **Controle Financeiro:** Gerenciamento de faturamento mensal, fluxo de caixa detalhado, controle de mensalidades pagas e pendentes, e saldo acumulado com transição de saldos de meses anteriores.
- **Grade de Horários:** Visualização completa da programação de aulas semanais.

### 🎓 Perfil Professor (Teacher)
- **Consultar Alunos:** Acesso à listagem de alunos para acompanhamento das turmas.
- **Grade de Horários:** Visualização completa da programação de aulas.
- **Contato:** Acesso aos canais de comunicação e suporte.

### 🥋 Perfil Aluno (Student)
- **Perfil do Atleta:** Histórico completo de graduações, datas de exames de faixa, dados cadastrais e visualização do status de pagamentos.
- **Grade de Horários:** Consulta de horários de aulas.
- **Contato/Suporte:** Acesso à localização da academia integrada com mapa e formulário para contato direto.

### 📱 Funcionalidades PWA (Progressive Web App)
- **Instalação Facilitada:** Botão "Instalar Aplicativo" integrado à barra de navegação, Hero da Landing Page e rodapé da barra lateral interna (Desktop/Android).
- **Compatibilidade com iOS:** Modal dinâmico instrutivo guiando o usuário a adicionar o aplicativo à tela de início a partir do Safari no iPhone/iPad.
- **Suporte Offline:** O aplicativo permanece funcional mesmo sem conexão de internet (servindo recursos em cache via Service Worker). Banner de aviso vermelho no topo da interface alerta quando o app está operando sem conexão ativa.
- **Tela Offline Customizada:** Exibição de uma tela offline amigável e estilizada caso o usuário acesse o app sem conexão e sem recursos previamente cacheados.

---

## 🛠️ Tecnologias Utilizadas

A aplicação foi construída utilizando ferramentas modernas do ecossistema Web:

- **Frontend Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool & Bundler:** [Vite](https://vite.dev/)
- **Backend as a Service:** [Supabase](https://supabase.com/) (Banco de Dados PostgreSQL, Autenticação, etc.)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **PWA Tooling:** [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) (para Service Worker e manifest)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Servidor Web & Proxy (Produção):** [Nginx](https://www.nginx.com/)
- **Containerização:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 📦 Como Executar o Projeto

Você pode rodar este projeto de três formas: **Localmente para desenvolvimento frontend**, **Integrado com Supabase local** ou via **Docker** para produção.

### 1. Executando o Frontend Localmente (Desenvolvimento)

#### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) (versão 20 ou superior recomendada) e o `npm` instalados em sua máquina.

#### Passo a Passo
1. Navegue até a pasta do projeto:
   ```bash
   cd sfbjj
   ```
2. Instale as dependências necessárias:
   ```bash
   npm install
   ```
3. Crie e configure o arquivo `.env` na raiz do projeto (use as credenciais do seu Supabase):
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
   ```
4. Inicie o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
5. Abra o navegador no endereço indicado no terminal (geralmente [http://localhost:5173](http://localhost:5173)).

---

### 2. Gerenciando o Backend Localmente (Supabase CLI)

O projeto possui um executável do Supabase CLI (`supabase.exe`) integrado para facilitar o desenvolvimento local com banco de dados PostgreSQL e migrações.

#### Pré-requisitos
Ter o Docker rodando em sua máquina (necessário para subir os containers do Supabase local).

#### Comandos Úteis do Supabase Local
Para interagir com o backend local do Supabase usando o executável do repositório:

- **Iniciar o Supabase local:**
  ```powershell
  .\supabase start
  ```
  *Isso iniciará os containers locais do PostgreSQL, Auth, Storage, Studio, etc. Ao finalizar o carregamento, serão fornecidas as credenciais locais (URL, Anon Key) e a URL do painel administrativo local (geralmente `http://localhost:54321`).*

- **Parar o Supabase local:**
  ```powershell
  .\supabase stop
  ```

- **Resetar o banco de dados e aplicar migrações:**
  ```powershell
  .\supabase db reset
  ```
  *Este comando apaga os dados locais e reexecuta todas as migrações na pasta `supabase/migrations` na ordem correta.*

- **Verificar o status dos serviços:**
  ```powershell
  .\supabase status
  ```

- **Criar uma nova migração:**
  ```powershell
  .\supabase migration new nome_da_migracao
  ```

#### Estrutura de Migrações do Banco
As migrações SQL na pasta `supabase/migrations/` contêm a definição da estrutura do banco:
1. `01_novas_funcionalidades.sql`: Tabelas e relacionamentos iniciais.
2. `02_graduacoes_lote.sql`: Funções para atualização de graduações em lote.
3. `03_administradores.sql`: Tabela de administradores e chaves estrangeiras.
4. `04_separacao_tabelas.sql`: Ajustes na separação de tabelas e definição de tipos de dados.

---

### 3. Executando via Docker (Produção/Homologação)

O projeto possui suporte nativo para containerização em múltiplos estágios (Multi-stage build) com Nginx configurado para lidar com o roteamento SPA (Single Page Application) e HTTPS para o Service Worker do PWA.

#### Pré-requisitos
Certifique-se de ter o [Docker](https://www.docker.com/) e o [Docker Compose](https://docs.docker.com/compose/) instalados e rodando em sua máquina.

#### Opção A: Utilizando Docker Compose (Recomendado)
Para subir o container de maneira rápida e isolada:

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
Caso queira construir e rodar a imagem manualmente sem o compose:

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
> Para que os recursos de PWA (instalação e service worker) funcionem plenamente no navegador fora do `localhost`, a aplicação deve ser servida obrigatoriamente através do protocolo **HTTPS**.

---

## 📂 Estrutura de Pastas

```text
sfbjj/
├── public/                 # Arquivos estáticos (ícones PWA, offline.html, favicon)
├── src/
│   ├── assets/             # Imagens e mídias estáticas
│   ├── components/         # Componentes React (Dashboard, Financeiro, Alunos, PWAInstallPrompt, etc.)
│   ├── hooks/              # Custom Hooks (usePWAInstall.ts)
│   ├── types/              # Tipagens globais do TypeScript
│   ├── mockData.ts         # Dados de exemplo do sistema (alunos, pagamentos, avisos)
│   ├── App.tsx             # Componente raiz e gerenciador de estado unificado
│   └── main.tsx            # Ponto de entrada do React
├── supabase/               # Configuração e migrações do backend local Supabase
│   ├── migrations/         # Scripts de migração SQL
│   └── config.toml         # Configuração do Supabase CLI
├── Dockerfile              # Configuração de build do Docker de produção
├── docker-compose.yml      # Configuração do Docker Compose para produção
├── nginx.conf              # Configuração do Nginx para roteamento da aplicação
├── supabase.exe            # Executável do Supabase CLI local
└── package.json            # Scripts, dependências e metadados do projeto
```

---

## 📜 Licença

Este projeto está sob a licença [MIT](LICENSE). Consulte o arquivo `LICENSE` para obter mais detalhes.

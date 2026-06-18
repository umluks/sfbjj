# SFBJJ - Sistema de Gestão de Academia de Jiu-Jitsu

O **SFBJJ** é um sistema moderno de gestão interna desenvolvido para academias de Jiu-Jitsu (SFBJJ). A aplicação foi projetada para facilitar a administração de alunos, controle financeiro, visualização de grades de horários e acompanhamento de perfis individuais de atletas (graduação, frequência, pagamentos e dados pessoais).

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

---

## 🛠️ Tecnologias Utilizadas

A aplicação foi construída utilizando ferramentas modernas do ecossistema Web:

- **Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vite.dev/)
- **Backend as a Service:** [Supabase](https://supabase.com/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Servidor Web & Proxy (Produção):** [Nginx](https://www.nginx.com/)
- **Containerização:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 📦 Como Subir o Projeto (Instruções de Execução)

Você pode rodar este projeto de duas maneiras: **Localmente para desenvolvimento** ou via **Docker** para simular o ambiente de produção.

### 1. Executando Localmente (Desenvolvimento)

#### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) (versão 20 ou superior recomendado) e o `npm` instalados em sua máquina.

#### Passo a Passo
1. Clone o repositório ou navegue até a pasta do projeto:
   ```bash
   cd sfbjj
   ```

2. Instale as dependências necessárias:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```

4. Abra o navegador no endereço indicado no terminal (geralmente [http://localhost:5173](http://localhost:5173)).

---

### 2. Executando via Docker (Produção)

O projeto possui suporte nativo para containerização em múltiplos estágios (Multi-stage build) com Nginx configurado para lidar com o roteamento SPA (Single Page Application).

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

---

## 📂 Estrutura de Pastas

```text
sfbjj/
├── public/                 # Arquivos estáticos
├── src/
│   ├── assets/             # Imagens e mídias estáticas
│   ├── components/         # Componentes React (Dashboard, Financeiro, Alunos, etc.)
│   ├── types/              # Tipagens globais do TypeScript
│   ├── mockData.ts         # Dados de exemplo do sistema (alunos, pagamentos, avisos)
│   ├── App.tsx             # Componente raiz e gerenciador de estado unificado
│   └── main.tsx            # Ponto de entrada do React
├── Dockerfile              # Configuração de build do Docker
├── docker-compose.yml      # Configuração do Docker Compose
├── nginx.conf              # Configuração do Nginx para roteamento da aplicação
└── package.json            # Scripts e dependências do projeto
```

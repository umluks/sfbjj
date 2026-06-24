# Plano de Implementação: PWA Completa para o Sistema SFBJJ

Este plano detalha a conversão do sistema SFBJJ em um Progressive Web App (PWA) de produção, implementando todos os requisitos de instalação, offline, design premium e compatibilidade de navegadores, além de otimizações de acessibilidade e melhores práticas exigidas para pontuação máxima no Lighthouse.

## User Review Required

> [!IMPORTANT]
> A implementação adicionará o `vite-plugin-pwa` ao pipeline de build do Vite. O Service Worker será registrado de forma automática em produção. O botão de instalação ficará disponível no cabeçalho e menu da Landing Page, bem como no rodapé da Sidebar do painel administrativo.

## Proposed Changes

### Dependências e Configuração de Compilação

#### [MODIFY] [package.json](file:///c:/Users/Public/Lucas/dev/sfbjj/package.json)
- Instalar `vite-plugin-pwa` como `devDependency`.
- Configurar script de build e garantir compatibilidade.

#### [MODIFY] [vite.config.ts](file:///c:/Users/Public/Lucas/dev/sfbjj/vite.config.ts)
- Configurar o `VitePWA` com as propriedades:
  - `registerType: 'autoUpdate'` para atualização automática sem interromper o usuário.
  - Estratégia `GenerateSW` padrão.
  - Manifest completo configurando `name`, `short_name`, `theme_color`, `background_color`, `display: standalone` e os caminhos dos ícones.
  - Configuração do Workbox para cache de assets estáticos e rotas.

---

### Assets e Configurações de Entrada

#### [NEW] [pwa-icon-base.png](file:///c:/Users/Public/Lucas/dev/sfbjj/public/pwa-icon-base.png)
- Criar um ícone de marca minimalista tridimensional com o logo "SFBJJ" em dourado premium sobre um fundo preto sólido usando a ferramenta de IA.

#### [NEW] [pwa-192x192.png](file:///c:/Users/Public/Lucas/dev/sfbjj/public/pwa-192x192.png)
- Ícone PWA gerado na resolução 192x192 a partir do ícone base.

#### [NEW] [pwa-512x512.png](file:///c:/Users/Public/Lucas/dev/sfbjj/public/pwa-512x512.png)
- Ícone PWA gerado na resolução 512x512 a partir do ícone base.

#### [NEW] [maskable-icon.png](file:///c:/Users/Public/Lucas/dev/sfbjj/public/maskable-icon.png)
- Ícone maskable de 512x512 com uma margem de segurança segura (safe-zone) para suportar recortes de diferentes plataformas móveis.

#### [NEW] [offline.html](file:///c:/Users/Public/Lucas/dev/sfbjj/public/offline.html)
- Página offline estática ultra-premium para quando não houver internet na primeira carga ou fallback profundo, estilizada com a marca SFBJJ, animações CSS e um botão de "Tentar Novamente".

#### [MODIFY] [index.html](file:///c:/Users/Public/Lucas/dev/sfbjj/index.html)
- Alterar atributo `lang` para `pt-BR` (melhoria de acessibilidade).
- Adicionar tags meta recomendadas para suporte a PWA em dispositivos iOS:
  - `apple-mobile-web-app-capable`
  - `apple-mobile-web-app-status-bar-style` (fundo preto)
  - `apple-mobile-web-app-title`
  - `<link rel="apple-touch-icon" href="/pwa-192x192.png" />`
  - Meta tag `theme-color` com valor `#000000`.

---

### Desenvolvimento e Lógica do App

#### [NEW] [usePWAInstall.ts](file:///c:/Users/Public/Lucas/dev/sfbjj/src/hooks/usePWAInstall.ts)
- Custom Hook React que escuta o evento `beforeinstallprompt`.
- Controla o estado de instalabilidade, detecção de execução standalone (se já está instalado) e disponibiliza a função para disparar a instalação.
- Adiciona detecção de dispositivo iOS para auxiliar na instalação em iPhones e iPads.

#### [NEW] [PWAInstallPrompt.tsx](file:///c:/Users/Public/Lucas/dev/sfbjj/src/components/PWAInstallPrompt.tsx)
- Modal com animações suaves e design premium ensinando usuários de iOS como adicionar o app à tela de início (botão de compartilhamento + adicionar à tela de início).

#### [MODIFY] [LandingPage.tsx](file:///c:/Users/Public/Lucas/dev/sfbjj/src/components/LandingPage.tsx)
- Importar e consumir o hook `usePWAInstall`.
- Exibir o botão "Instalar Aplicativo" no menu de navegação e na seção Hero quando disponível.
- Exibir o prompt do iOS quando aplicável.

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/Public/Lucas/dev/sfbjj/src/components/Sidebar.tsx)
- Importar e consumir o hook `usePWAInstall`.
- Exibir uma opção "Instalar Aplicativo" na Sidebar acima do botão "Sair da Conta" para usuários logados no painel.

#### [MODIFY] [App.tsx](file:///c:/Users/Public/Lucas/dev/sfbjj/src/App.tsx)
- Adicionar um aviso de rede offline no topo da SPA usando detecção de eventos `online`/`offline`.
- Garantir tratamentos de erro adequados para chamadas do Supabase em modo offline sem estragar a renderização da interface do usuário.

---

### Otimizações do Lighthouse (Acessibilidade & Boas Práticas)
- Adicionar atributos `aria-label` adequados a todos os botões e links de ícones que possam estar sem descrição (como botões de fechar, links de redes sociais no footer, etc.).
- Garantir contraste visual correto nos novos elementos PWA.

## Verification Plan

### Automated Tests
1. Rodar `npm run build` para validar que o compilador do TypeScript e o bundler do Vite geram o build sem erros de compilação.
2. Rodar a verificação de lint: `npm run lint`.

### Manual Verification
1. Subir o servidor local com o build de produção (`npm run preview` ou similar).
2. Acessar o sistema através do navegador Chrome/Edge no Desktop.
3. Verificar a presença e o correto funcionamento do botão "Instalar Aplicativo".
4. Abrir as Ferramentas do Desenvolvedor (DevTools) e verificar a aba "Application -> Service Workers" e "Manifest" para confirmar se o service worker está rodando e se os metadados do PWA estão corretos.
5. Colocar o navegador no modo offline (DevTools -> Network -> Offline) e recarregar a página para certificar-se de que a página offline e o cache funcionam.
6. Testar o fluxo de login em modo offline (deve notificar o usuário de forma amigável ou manter dados visíveis em cache onde possível).
7. Validar acessibilidade e conformidade rodando o Lighthouse PWA e Acessibilidade no navegador Chrome.

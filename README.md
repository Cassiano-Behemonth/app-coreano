<div align="center">

# 📱 Chongi-Manager (NFS-e & Comprovantes)
### Organizador Inteligente e Offline de Fotos, Recibos & Comprovantes

[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?style=for-the-badge&logo=capacitor)](https://capacitorjs.com/)
[![Offline First](https://img.shields.io/badge/Storage-100%25%20Offline-10B981?style=for-the-badge)](https://dexie.org/)

<p align="center">
  <b>Um aplicativo mobile-first com design Bento Grid Dark para capturar, organizar, filtrar e compartilhar fotos de comprovantes e NFS-e de forma 100% offline.</b>
</p>

</div>

---

## ✨ Principais Funcionalidades

* 🍱 **Interface Bento Grid Dark:** Design minimalista e espaçoso inspirado em apps premium (*Raycast, Linear, Apple Fitness*), com cards arredondados, alto contraste e barra dock flutuante.
* 📅 **Filtro por Data & Dia Específico:** Filtre instantaneamente por data selecionando um dia no calendário ou usando atalhos rápidos (*Hoje, Ontem, Últimos 7 dias*).
* 🏷️ **Organização por Apelidos e Pastas:** Cadastro ágil focando no nome amigável do serviço (ex: *"Reforma Escritório"*, *"Conserto Ar Condicionado"*), número da NF e categorização em pastas físicas no aparelho.
* 📸 **Compressão de Fotos no Aparelho:** Otimização instantânea via Canvas que reduz imagens pesadas de câmeras sem perda visual, economizando até 85% de memória.
* 🚀 **Compartilhamento & Download Direto:** Baixe fotos para a galeria ou compartilhe múltiplos comprovantes diretamente com WhatsApp, Email ou Google Drive em 1 clique.
* 🔒 **100% Offline & Privado:** Zero dependência de servidores externos. Todos os dados e imagens ficam salvos localmente na memória do aparelho.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Função |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | Interface reativa e tipagem estrita |
| **Estilização** | Vanilla CSS + Design System | Bento Grid Dark Mode com micro-interações e espaçamento arejado |
| **Otimização de Fotos** | HTML5 Canvas Client-side | Redimensionamento e compressão leve no navegador |
| **Banco de Dados** | Dexie.js (IndexedDB) | Armazenamento local estruturado e seguro |
| **Mobile Nativo** | Capacitor | Integração com sistema de arquivos e compartilhamento nativo |

---

## 🚀 Como Executar o Projeto Localmente

### 1. Clonar o Repositório
```bash
git clone https://github.com/Cassiano-Behemonth/app-coreano.git
cd app-coreano
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
> O app estará rodando em: `http://localhost:5173`

---

## 📱 Como Instalar no Celular

### Opção 1: Instalação Instantânea (PWA)
1. Acesse o endereço `http://<IP-DO-SEU-PC>:5173` pelo navegador do seu celular (conectado no mesmo Wi-Fi).
2. No menu do navegador (Chrome ou Safari), toque em **"Instalar Aplicativo"** ou **"Adicionar à Tela de Início"**.
3. O app abrirá em tela cheia como um aplicativo nativo e funcionará 100% offline.

### Opção 2: Gerar APK no Android Studio
1. Abra o **Android Studio**.
2. Clique em **Open** e selecione a pasta `android/` deste projeto.
3. No menu superior, vá em **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. O arquivo `.apk` será gerado na pasta `android/app/build/outputs/apk/debug/`.

---

## 📂 Estrutura de Pastas

```text
├── android/               # Projeto nativo do Android Studio com Gradle
├── public/                # Manifesto PWA, ícones e assets estáticos
├── src/
│   ├── components/        # Componentes UI (BentoGrid, AlbumCard, Modais)
│   ├── services/          # Otimizador de imagem, Banco IndexedDB e Compartilhamento
│   ├── types/             # Definições de tipos TypeScript
│   ├── App.tsx            # Tela principal e controle de estado
│   └── index.css          # Design system e tema Bento Dark
└── package.json           # Dependências e scripts do projeto
```

---

<div align="center">
  <sub>Desenvolvido com foco em velocidade, privacidade e usabilidade.</sub>
</div>

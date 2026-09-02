# 📋 Status de Atualizações & Diagnóstico — Chongi-Manager

**Data da Atualização:** 02 de Setembro de 2026  
**Status do Build:** ✅ Aprovado (`tsc -b && vite build` 100% sem erros)  
**Versão:** 1.1.0  

---

## 🎨 1. Novo Layout do Modal de Detalhes (`AlbumDetailModal`)

Conforme solicitado, o layout foi remodelado para priorizar o fluxo natural de captura e ações contextuais:

1. **Distribuição Estratégica dos Botões:**
   - **Barra Superior:** Contém o botão **`[ 🔗 Compartilhar ]`** e o botão **`[ ➕ Galeria ]`** (mantido lá em cima, conforme solicitado).
   - **Rodapé Fixo Inferior Dinâmico:**
     - **Sem foto pressionada:** Exibe o botão grande **`[ 📷 Tirar Foto ]`** em largura total.
     - **Com foto pressionada:** O botão grande transforma-se instantaneamente em **2 botões lado a lado**:
       1. **`[ 📷 Tirar Foto ]`** (para tirar outra foto principal normal)
       2. **`[ ➕ + Variante (#Xb) ]`** (em azul destacado, para capturar a foto variante diretamente daquela foto pressionada).

2. **Ações Contextuais de Seleção:**
   - **Nenhuma foto selecionada:** Exibe no topo `[ Compartilhar ]` e `[ ➕ Galeria ]`.
   - **1 foto selecionada:** No topo exibe `[ Compartilhar (1) ]` e `[ ➕ Galeria ]`, e no rodapé inferior o botão de Tirar Foto se divide em `[ Tirar Foto ]` e `[ + Variante (#Xb) ]`.
   - **Tocar na Foto:** Tocar diretamente em qualquer foto do grid agora a seleciona de imediato (com botão dedicado de zoom no canto superior esquerdo).
   - **Múltiplas fotos selecionadas:** Exibe **`[ Compartilhar (X) ]`** e **`[ ➕ Galeria ]`**.

3. **Novo Padrão de Numeração de Fotos:**
   - As legendas foram enxugadas de `Foto #1`, `Foto #2` para **`#1`**, **`#2`**, **`#3`**, etc.
   - Legendas antigas com o prefixo `Foto #` são normalizadas automaticamente para o novo padrão sem quebrar cadastros anteriores.

4. **Fotos Variantes Lado a Lado (`#1` e `#1b`, `#1c`...):**
   - Ao selecionar uma foto (ex: `#1`) e tocar em **`+ Foto Variante`**, o usuário escolhe Câmera ou Galeria.
   - A nova foto recebe automaticamente a legenda sequencial alfabética (`#1b`, `#1c`, `#1d`, etc.).
   - **Visualização Lado a Lado:** Qualquer foto que contenha variantes é renderizada em um bloco horizontal exclusivo onde a foto principal e suas variantes aparecem **lado a lado** (`#1 ➔ #1b`), sem quebrar para colunas soltas nem se misturar com fotos não relacionadas.

---

## 🛠️ 2. Correções de Erros & Estabilidade

1. **Correção de Perda de Fotos (Race Condition na Galeria):**
   - **Problema:** Ao selecionar várias fotos juntas pela galeria no modal de detalhes, chamadas sequenciais sob o estado anterior do React faziam uma foto sobrescrever a outra no IndexedDB.
   - **Solução:** Implementado processamento em lote `handleAddPhotosToAlbum` que busca o registro atômico diretamente do banco (`getAlbumById`), comprime as imagens em paralelo via `Promise.all` e salva tudo em uma única transação segura.

2. **Reset de Inputs de Arquivo (`onChange` Repetido):**
   - **Problema:** Em smartphones, fotos tiradas seguidas com a câmera frequentemente recebem o mesmo nome temporário do sistema (`image.jpg`), impedindo o evento `onChange` de disparar na segunda foto.
   - **Solução:** Adicionado `e.target.value = ''` em todos os inputs (`AddPhotosModal`, `AlbumDetailModal`, `EditAlbumModal`).

3. **Feedback de Compartilhamento & Confetes:**
   - **Problema:** Ao cancelar a janela de compartilhamento nativo do celular, o sistema retornava sucesso e disparava confetes.
   - **Solução:** O cancelamento agora retorna `success: false` sem disparar confetes indevidamente.

4. **Fallback Inteligente no Compartilhamento Web:**
   - Caso o navegador não suporte anexar arquivos nativos via Web Share (`canShare({ files })`), o sistema aciona automaticamente o download direto das fotos com nomes organizados (`<apelido>_<legenda>.jpg`).

5. **Padronização de Nome no Android (APK) & Capacitor:**
   - Atualizado `capacitor.config.ts` de `NFSeManager` para `Chongi-Manager`.
   - Atualizado `android/app/src/main/res/values/strings.xml` (`app_name` e `title_activity_main` para `Chongi-Manager`).
   - Atualizado `package.json` (`name: "chongi-manager"`).

6. **Limpeza de Código Morto:**
   - Removido o arquivo `src/App.css` (185 linhas de template padrão do Vite que não estavam em uso).

---

## 📁 3. Arquivos Alterados

- `src/components/AlbumDetailModal.tsx` — Inversão do layout, ação contextual "+ Foto Variante", badges `#1` / `#1b`.
- `src/services/photoNumbering.ts` — Utilitário de formatação de legendas e geração de variantes `#1b, #1c...`.
- `src/services/sharePhotos.ts` — Correção de cancelamento e fallback de download.
- `src/services/db.ts` — Suporte a nomes de arquivos físicos com a legenda e exportação de `getAlbumById`.
- `src/App.tsx` — Suporte a salvamento em lote de fotos e inserção de variantes adjacentes à foto pai.
- `src/components/EditAlbumModal.tsx` — Padrão `#1` e reset de input.
- `src/components/AddPhotosModal.tsx` — Reset de input de arquivo.
- `src/components/InstallAppBanner.tsx` — Inicialização síncrona sem re-render em efeito.
- `capacitor.config.ts` & `android/.../strings.xml` — Padronização de nome do aplicativo.
- `package.json` — Atualização do nome do projeto.

---

## 🚀 4. Como Validar Localmente

```bash
# Rodar linter
npm run lint

# Compilar build de produção
npm run build

# Iniciar servidor local
npm run dev
```

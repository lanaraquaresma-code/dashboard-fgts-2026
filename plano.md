# 🏗️ Plano de Reestruturação — Dashboard FGTS 2026

## Diagnóstico do Problema Atual

O projeto inteiro vive dentro de **um único arquivo HTML de ~1.800 linhas** ([Dashboard_ATUALIZADO.html](file:///c:/FGTS_NOVO/Dashboard_ATUALIZADO.html)):

| Seção | Linhas | O que contém |
|---|---|---|
| `<style>` embutido | 1–1144 | **~1.100 linhas** de CSS, incluindo variáveis, componentes, animações, responsivo |
| `<body>` HTML | 1147–1380 | Markup do layout (topbar, modais, grids, tabelas, gráficos SVG) |
| `<script>` embutido | 1381–1813 | **~430 linhas** de JS — dados hardcoded, lógica de render, formatadores, alertas |
| Dados (`const DATA`) | Linha 1387 | JSON gigante embutido diretamente no JS |

### Problemas concretos

- **Qualquer alteração exige editar o mesmo arquivo gigante** — risco alto de quebrar algo
- **Dados ficam dentro do HTML** — o script Python precisa fazer find/replace frágil (`html.find("const DATA =")`)
- **CSS e JS misturados** — impossível testar, debugar ou reutilizar separadamente
- **Código duplicado** — topbar é atualizada 2x, mesma lógica de formatação repetida
- **Sem controle de versão** — backups manuais em pastas (Backup v.1, v.2, v.3)
- **Bugs silenciosos** — linha 1 tem `<veja se ta certo !DOCTYPE html>` em vez de `<!DOCTYPE html>`
- **`console.log` perdido** na linha 1817 fora do `<html>`

---

## Estrutura Proposta

```
FGTS_NOVO/
├── index.html              ← HTML limpo, só estrutura (~120 linhas)
├── css/
│   └── styles.css          ← Todo o CSS extraído e organizado
├── js/
│   ├── data.js             ← const DATA = {...} — gerado pelo Python
│   ├── helpers.js           ← Formatadores (fmtR, pct, M, statusOf, etc.)
│   ├── components.js        ← Renderizadores (KPI cards, barras, tabela, gauge)
│   └── main.js              ← Inicialização e orquestração
├── data/
│   └── BASE_FGTS.xlsx       ← Planilha fonte (não versionada no Git)
├── scripts/
│   └── atualizar.py          ← Script Python melhorado
├── .gitignore
├── README.md
└── LICENSE
```

---

## Etapas de Implementação

### Fase 1 — Separar CSS (arquivo `css/styles.css`)

> Extrair todo o conteúdo da tag `<style>` (linhas 11–1144) para `css/styles.css`

- Mover todas as ~1.100 linhas de CSS para o arquivo externo
- No HTML, substituir o `<style>...</style>` por:
  ```html
  <link rel="stylesheet" href="css/styles.css">
  ```
- Organizar o CSS em seções com comentários claros:
  - `/* === VARIÁVEIS (Design Tokens) === */`
  - `/* === RESET === */`
  - `/* === TOPBAR === */`
  - `/* === KPI CARDS === */`
  - `/* === GAUGE === */`
  - `/* === TABELA === */`
  - `/* === MODAL === */`
  - `/* === RESPONSIVO === */`

---

### Fase 2 — Separar Dados (arquivo `js/data.js`)

> O JSON gigante da linha 1387 passa a ser um arquivo separado

**`js/data.js`**:
```js
// Gerado automaticamente por scripts/atualizar.py
// Não editar manualmente!
const DATA = { ... };
```

**Benefício crítico**: O `atualizar.py` agora só sobrescreve este arquivo pequeno, em vez de fazer find/replace num HTML de 1800 linhas. Isso elimina o bug mais perigoso do sistema atual.

---

### Fase 3 — Separar JavaScript (arquivos `js/helpers.js`, `js/components.js`, `js/main.js`)

**`js/helpers.js`** — Funções puras de formatação:
```js
// Formatação monetária
const M = (v) => { ... };
const fmtR = (v) => 'R$ ' + M(v);
const pct = (a, b) => { ... };
const cl = (v, mn, mx) => Math.min(mx, Math.max(mn, v));
const statusOf = (r) => { ... };

// Constantes de status
const SCLR = { ok: '#22c55e', watch: '#f59e0b', hot: '#f87171', crit: '#ff4444' };
const SLBL = { ok: 'Normal', watch: 'Monitorar', hot: 'Atenção Alta', crit: '⚠ CRÍTICO' };
const BCLS = { ok: 'b-ok', watch: 'b-watch', hot: 'b-hot', crit: 'b-crit' };
const BTOP = { ok: '#16a34a', watch: '#d97706', hot: '#ef4444', crit: '#dc2626' };
```

**`js/components.js`** — Renderizadores de cada seção:
```js
function renderAlertas() { ... }
function renderKPICards() { ... }
function renderStackedBars() { ... }
function renderTable() { ... }
function renderFilaCards() { ... }
function renderRemanCards() { ... }
function renderGauge() { ... }
function renderTopbar() { ... }
```

**`js/main.js`** — Ponto de entrada:
```js
document.addEventListener('DOMContentLoaded', () => {
  renderTopbar();
  renderAlertas();
  renderGauge();
  renderKPICards();
  renderStackedBars();
  renderTable();
  renderFilaCards();
  renderRemanCards();
});
```

---

### Fase 4 — Limpar o HTML (`index.html`)

O HTML final ficará com **~120 linhas**, contendo apenas:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FGTS 2026 · Pró-Transporte · Painel Orçamentário</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <!-- Estrutura do layout (sem CSS inline, sem JS inline) -->
  <nav class="topbar">...</nav>
  <div class="modal-overlay" id="uModal">...</div>
  <div class="main">...</div>
  <footer>...</footer>

  <script src="js/data.js"></script>
  <script src="js/helpers.js"></script>
  <script src="js/components.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

---

### Fase 5 — Corrigir Bugs Conhecidos

| Bug | Local atual | Correção |
|---|---|---|
| `<veja se ta certo !DOCTYPE html>` | Linha 1 | Corrigir para `<!DOCTYPE html>` |
| `console.log` fora do `<html>` | Linha 1817 | Remover |
| `console.log(DATA.regioes[3])` | Linha 1388 | Remover |
| Topbar atualizada 2x (duplicado) | Linhas 1500–1510 e 1790–1800 | Manter apenas uma vez |
| Dois listeners de click no modal (duplicado) | Linhas 1777–1780 | Manter apenas um |
| String vazia perdida ` `` ` | Linha 1408 | Remover |

---

### Fase 6 — Atualizar `atualizar.py`

O script Python ficará **muito mais simples e seguro**:

```python
# Antes: find/replace perigoso em 1800 linhas de HTML
inicio = html.find("const DATA =")
fim = html.find("};", inicio) + 2

# Depois: simplesmente sobrescrever um arquivo pequeno
with open("js/data.js", 'w', encoding='utf-8') as f:
    f.write("// Gerado automaticamente em " + data_hora + "\n")
    f.write("const DATA = " + json.dumps(DATA) + ";\n")
```

Não precisa mais manter dois HTMLs (`Dashboard_base.html` e `Dashboard_ATUALIZADO.html`). Agora existe apenas **um `index.html` que nunca muda**, e o Python só atualiza `js/data.js`.

---

### Fase 7 — Preparar para GitHub

#### 7.1 — Criar `.gitignore`
```gitignore
# Dados sensíveis / pesados
data/BASE_FGTS.xlsx
data/*.xlsx
~$*

# Backups antigos
Backup/

# OS
Thumbs.db
.DS_Store
desktop.ini
```

#### 7.2 — Criar `README.md`
```markdown
# 🚌 Dashboard FGTS 2026 — Pró-Transporte

Dashboard de acompanhamento orçamentário do programa Pró-Transporte,
exercício 2026, conforme IN nº 47/2026.

## Como usar
1. Atualize a planilha `data/BASE_FGTS.xlsx`
2. Execute `python scripts/atualizar.py`
3. Abra `index.html` no navegador

## Estrutura do projeto
...
```

#### 7.3 — Inicializar repositório
```bash
cd FGTS_NOVO
git init
git add .
git commit -m "Refatoração: separar CSS, JS e dados do HTML monolítico"
git remote add origin https://github.com/SEU_USUARIO/dashboard-fgts-2026.git
git push -u origin main
```

---

## Resumo das Mudanças

| Antes | Depois |
|---|---|
| 1 arquivo HTML de 1.817 linhas | 6 arquivos organizados (~120 + ~1100 + ~50 + ~80 + ~200 + ~80 linhas) |
| CSS inline | `css/styles.css` |
| JS inline | `js/helpers.js` + `js/components.js` + `js/main.js` |
| Dados hardcoded no HTML | `js/data.js` (gerado pelo Python) |
| Python faz find/replace frágil | Python sobrescreve 1 arquivo pequeno |
| Backups manuais em pastas | Git com histórico completo |
| Bugs silenciosos | Código limpo e validado |

---

## Riscos e Cuidados

> [!WARNING]
> **O dashboard deve continuar idêntico visualmente.** Nenhuma alteração visual será feita — apenas reorganização do código.

> [!IMPORTANT]
> **Testar no navegador após cada fase.** Abrir o `index.html` e comparar com o dashboard atual para garantir que nada quebrou.

> [!NOTE]
> **A planilha `BASE_FGTS.xlsx` NÃO será versionada no Git** por conter dados potencialmente sensíveis. Somente a estrutura e o código serão publicados.

---

## Pergunta para Você

1. **O repositório GitHub será público ou privado?** (dados do governo podem ser sensíveis)
2. **Quer que eu execute esse plano agora?** Posso fazer fase por fase, testando a cada etapa.
3. **Quer manter os backups antigos** (Backup v.1, v.2, v.3) ou podemos descartá-los?

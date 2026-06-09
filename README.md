# 🚌 Dashboard FGTS 2026 — Pró-Transporte

Dashboard de acompanhamento orçamentário do programa Pró-Transporte,
exercício 2026, conforme IN nº 47/2026.

## Como usar

1. Coloque a planilha atualizada em `data/BASE_FGTS.xlsx`
2. Execute o script de atualização:
   ```
   python scripts/atualizar.py
   ```
3. Abra `index.html` no navegador

## Estrutura do projeto

```
FGTS_NOVO/
├── index.html              ← HTML limpo (~120 linhas)
├── css/
│   └── styles.css          ← Todo o CSS
├── js/
│   ├── data.js             ← Dados (gerado pelo Python — não editar)
│   ├── helpers.js          ← Formatadores e constantes de status
│   ├── components.js       ← Renderizadores de cada seção
│   └── main.js             ← Inicialização e orquestração
├── data/
│   └── BASE_FGTS.xlsx      ← Planilha fonte (não versionada no Git)
├── scripts/
│   └── atualizar.py        ← Lê o Excel e atualiza js/data.js
├── .gitignore
└── README.md
```

## Inicializar repositório Git

```bash
cd FGTS_NOVO
git init
git add .
git commit -m "Refatoração: separar CSS, JS e dados do HTML monolítico"
git remote add origin https://github.com/SEU_USUARIO/dashboard-fgts-2026.git
git push -u origin main
```

> **Atenção:** `data/BASE_FGTS.xlsx` está no `.gitignore` por conter dados
> potencialmente sensíveis. Somente o código é versionado.

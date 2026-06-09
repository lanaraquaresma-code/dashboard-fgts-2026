import pandas as pd
import json
from datetime import datetime
import os
import unicodedata

print("🔄 Atualizando dashboard...")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJ_DIR = os.path.dirname(BASE_DIR)          # sobe de scripts/ para FGTS_NOVO/

EXCEL_FILE  = os.path.join(PROJ_DIR, "data",  "BASE_FGTS.xlsx")
DATA_JS     = os.path.join(PROJ_DIR, "js",    "data.js")

# =========================
# FUNÇÃO PRA LIMPAR TEXTO
# =========================
def remover_acento(texto):
    if isinstance(texto, str):
        return ''.join(
            c for c in unicodedata.normalize('NFD', texto)
            if unicodedata.category(c) != 'Mn'
        )
    return texto

# =========================
# FUNÇÃO PRA TRATAR NaN
# =========================
def safe_float(valor):
    try:
        if pd.notna(valor):
            return float(valor)
        return 0.0
    except Exception:
        return 0.0

# =========================
# 1. LER EXCEL
# =========================
df = pd.read_excel(EXCEL_FILE, engine='openpyxl', header=None)
print("✅ Excel carregado")

# =========================
# 2. ENCONTRAR HEADER
# =========================
linha_header = None
for i, row in df.iterrows():
    if row.astype(str).str.contains("REGI", case=False).any():
        linha_header = i
        break

if linha_header is None:
    raise Exception("❌ Não encontrou linha com REGIÃO")

# =========================
# 3. AJUSTAR HEADER
# =========================
df.columns = df.iloc[linha_header]
df = df[(linha_header + 1):]

# =========================
# 4. NORMALIZAR COLUNAS
# =========================
df.columns = df.columns.astype(str).str.strip().str.upper()
df.columns = [remover_acento(col) for col in df.columns]

print("📊 Colunas:", df.columns.tolist())

# =========================
# 5. PEGAR COLUNA REGIÃO
# =========================
col_regiao = None
for col in df.columns:
    if "REGIA" in col:
        col_regiao = col
        break

if col_regiao is None:
    raise Exception("❌ Não encontrou coluna REGIAO")

# =========================
# 6. LIMPAR DADOS
# =========================
df = df[df[col_regiao].astype(str).str.upper() != "TOTAL GERAL"]

# =========================
# 7. MONTAR DADOS
# =========================
regioes = []
for _, row in df.iterrows():
    regioes.append({
        "nome":        row[col_regiao],
        "limite":      safe_float(row.get('LIMITE')),
        "a_avancar":   safe_float(row.get('A CONTRATAR AVANCAR')),
        "a_novopac":   safe_float(row.get('A CONTRATAR NOVO PAC')),
        "c_avancar":   safe_float(row.get('CONTRATADO EM 2026 AVANCAR')),
        "c_novopac":   safe_float(row.get('CONTRATADO EM 2026 NOVO PAC')),
        "selecao":     safe_float(row.get('SELECAO A PUBLICAR')),
        "executado":   safe_float(row.get('VALOR EXECUTADO')),
        "saldo":       safe_float(row.get('SALDO')),
        "comprometido": (
            safe_float(row.get('A CONTRATAR AVANCAR')) +
            safe_float(row.get('A CONTRATAR NOVO PAC'))
        ),
        "saldo_futuro": safe_float(row.get('SALDO REAL FUTURO')),
        "status":      str(row.get('STATUS DE ORCAMENTO')),
    })

print("✅ Dados processados:", len(regioes), "regiões")

# =========================
# 8. CRIAR OBJETO DATA
# =========================
DATA = {
    "atualizado": datetime.now().strftime("%d/%m/%Y"),
    "regioes": regioes,
    "totais": {
        "limite":       sum(r['limite']       for r in regioes),
        "executado":    sum(r['executado']    for r in regioes),
        "saldo":        sum(r['saldo']        for r in regioes),
        "comprometido": sum(r['comprometido'] for r in regioes),
        "saldo_futuro": sum(r['saldo_futuro'] for r in regioes),
    }
}

# =========================
# 9. GRAVAR js/data.js
# =========================
data_hora = datetime.now().strftime("%d/%m/%Y %H:%M")

with open(DATA_JS, 'w', encoding='utf-8') as f:
    f.write(f"// Gerado automaticamente em {data_hora}\n")
    f.write("// Não editar manualmente!\n")
    f.write("const DATA = " + json.dumps(DATA, ensure_ascii=False) + ";\n")

print(f"✅ SUCESSO! Arquivo gerado: {DATA_JS}")
print(f"   Regiões: {[r['nome'] for r in regioes]}")
print(f"   Data:    {DATA['atualizado']}")

input("\nPressione ENTER para fechar...")

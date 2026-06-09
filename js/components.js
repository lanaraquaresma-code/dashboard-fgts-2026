/* ══ COMPONENTS — Renderizadores de cada seção ══ */

/* ── Topbar ── */
function renderTopbar() {
  const elLim = document.getElementById('limiteTop');
  const elExe = document.getElementById('executadoTop');
  const elSal = document.getElementById('saldoTop');

  const limiteTotal = DATA.regioes.reduce((s, r) => s + r.limite, 0);
  const executadoTotal = DATA.regioes.reduce((s, r) => s + r.executado, 0);
  const saldoTotal = limiteTotal - executadoTotal;

  if (elLim) elLim.textContent = fmtR(limiteTotal);
  if (elExe) elExe.textContent = fmtR(executadoTotal);
  if (elSal) elSal.textContent = fmtR(saldoTotal);

  document.getElementById('dtTop').textContent = DATA.atualizado;
  document.getElementById('dtFoot').textContent =
    `Gerado em ${new Date().toLocaleDateString('pt-BR')} · Dados de ${DATA.atualizado}`;
}

function abrirInstrucao() {
  alert('✅ Atualização do Dashboard:\n\n1. Atualize o Excel (BASE_FGTS.xlsx)\n2. Execute python scripts/atualizar.py\n3. Abra o index.html novamente\n\nPronto 🚀');
}

/* ── Alertas ── */
function gerarAlertas() {
  const alertas = [];
  DATA.regioes.forEach(r => {
    const fila = (Number(r.a_avancar) || 0) + (Number(r.a_novopac) || 0) + (Number(r.selecao) || 0);
    const saldo = Number(r.saldo) || 0;
    const perc = saldo > 0 ? (fila / saldo) * 100 : 0;

    if (perc > 120) {
      alertas.push(
        '🚨 ' + r.nome.toUpperCase() +
        ' | Consumo: ' + perc.toFixed(1) + '% do saldo' +
        ' | Déficit: ' + fmtR(fila - saldo)
      );
    } else if (perc > 90) {
      alertas.push('⚠ ' + r.nome.toUpperCase() + ': risco alto (' + perc.toFixed(1) + '%)');
    }
  });
  return alertas;
}

function renderAlertas() {
  const alertas = gerarAlertas();
  const box = document.getElementById('alertasBox');
  if (!box) return;

  if (alertas.length === 0) {
    box.innerHTML = '<h3>✅ Nenhum risco crítico no momento</h3>';
  } else {
    box.innerHTML = alertas.map(a => `<h3>${a}</h3>`).join('');
  }
}

/* ── Gauge geral ── */
function renderGauge() {
  const t = DATA.totais;
  const limiteTotal = t.limite;
  const executado = t.executado;
  const selecaoTotal = DATA.regioes.reduce((s, r) => s + (Number(r.selecao) || 0), 0);
  const fila = t.comprometido + selecaoTotal;
  const saldo = t.saldo;

  const pctExec = executado / limiteTotal * 100;
  const pctFila = Math.min(fila / limiteTotal * 100, 100 - pctExec);
  const pctSaldo = Math.max(0, 100 - pctExec - pctFila);

  const fR = v => {
    if (Math.abs(v) >= 1e9)
      return 'R$ ' + (v / 1e9).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' bi';
    return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'M';
  };

  document.getElementById('gaugeGrandePct').textContent = pctExec.toFixed(1) + '%';
  document.getElementById('gaugeGrandeSaldo').textContent = fR(saldo);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const segExec = document.getElementById('segExec');
      const segFila = document.getElementById('segFila');
      const segSaldo = document.getElementById('segSaldo');

      segExec.style.width = pctExec + '%';
      segFila.style.width = pctFila + '%';

      if (pctExec > 8) segExec.setAttribute('data-label', pctExec.toFixed(1) + '% exec.');
      segFila.setAttribute('data-label', pctFila.toFixed(1) + '% demanda');
      if (pctSaldo > 6) segSaldo.setAttribute('data-label', fR(saldo) + ' livre');
    });
  });

  document.getElementById('lblExecMid').textContent = fR(executado) + ' executado';
  document.getElementById('lblLimite').textContent = fR(limiteTotal) + ' (limite)';

  const pipeline = DATA.regioes.reduce((s, r) => s + (parseFloat(r.a_avancar) || 0) + (parseFloat(r.a_novopac) || 0), 0);
  const selecaoTotalLocal = DATA.regioes.reduce((s, r) => s + (parseFloat(r.selecao) || 0), 0);
  const demandaTotal = pipeline + selecaoTotalLocal;

  const pillsEl = document.getElementById('gaugePills');
  pillsEl.innerHTML = '';
  [
    { lbl: 'Executado', val: fR(executado), clr: '#60a5fa' },
    { lbl: 'Saldo Futuro', val: fR(pipeline), clr: '#fbbf24' },
    { lbl: 'Seleção a Publicar', val: fR(selecaoTotalLocal), clr: '#a78bfa' },
    { lbl: 'Demanda Total', val: fR(demandaTotal), clr: '#ef4444' },
  ].forEach(p => {
    const div = document.createElement('div');
    div.className = 'g-pill';
    div.innerHTML =
      '<span class="gp-lbl">' + p.lbl + '</span>' +
      '<span class="gp-val" style="color:' + p.clr + '">' + p.val + '</span>';
    pillsEl.appendChild(div);
  });

  // Donut
  const C_outer = 2 * Math.PI * 38;
  const C_inner = 2 * Math.PI * 28;
  const offExec = C_outer * (1 - pctExec / 100);
  const pctFilaIn = Math.min(fila / limiteTotal * 100, 100);
  const offFila = C_inner * (1 - pctFilaIn / 100);

  document.getElementById('donutPctTxt').textContent = pctExec.toFixed(1) + '%';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById('donutExec').style.strokeDashoffset = offExec;
      document.getElementById('donutFila').style.strokeDashoffset = offFila;
    });
  });
}

/* ── KPI Cards ── */
function renderKPICards() {
  const kpiGrid = document.getElementById('kpiGrid');
  DATA.regioes.forEach(r => {
    const a_total = (Number(r.a_avancar) || 0) + (Number(r.a_novopac) || 0);
    const fila = r.a_avancar + r.a_novopac + r.selecao;
    const ratio = pct(fila, r.saldo);
    const execPct = pct(r.executado, r.limite);
    const saldoFut = (Number(r.saldo) || 0) - (Number(fila) || 0);
    const s = statusOf(r);
    const clr = SCLR[s];
    const C = 2 * Math.PI * 15;
    const off = C * (1 - cl(ratio, 0, 100) / 100);

    const d = document.createElement('div');
    d.className = `kpi-card s-${s}`;
    d.innerHTML = `
      <div class="kpi-reg">${r.nome}</div>
      <div class="ring-wrap"><svg class="ring-svg" viewBox="0 0 36 36">
        <circle class="ring-bg" cx="18" cy="18" r="15"/>
        <circle class="ring-fill" cx="18" cy="18" r="15" stroke="${clr}"
          stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"/>
      </svg></div>
      <div class="kpi-pct" style="color:${clr}">${ratio.toFixed(1)}%</div>
      <div class="kpi-lbl">comprometido</div>
      <div style="margin-top:6px;">
        <span style="font-size:14px;font-weight:700;color:#3b82f6">${Number(execPct || 0).toFixed(1)}%</span>
        <span style="font-size:10px;color:var(--dim);margin-left:4px;">executado</span>
      </div>
      <div class="kpi-div"></div>
      <div class="kpi-rows">
        <div class="kpi-row"><span class="l">Limite 2026</span><span class="v">${fmtR(r.limite)}</span></div>
        <div class="kpi-row"><span class="l">Executado</span><span class="v">${fmtR(r.executado)} <span style="color:${clr};font-size:9px">(${execPct.toFixed(1)}%)</span></span></div>
        <div class="kpi-row"><span class="l">Saldo oficial</span><span class="v">${fmtR(r.saldo)}</span></div>
        <div class="kpi-row"><span class="l">A Contratar</span><span class="v" style="color:${a_total > r.saldo * 0.7 ? '#fbbf24' : 'inherit'}">${fmtR(a_total)}</span></div>
        <div class="kpi-row"><span class="l">Seleção Pub.</span><span class="v">${fmtR(r.selecao)}</span></div>
        <div class="kpi-row"><span class="l">Saldo futuro</span><span class="v" style="color:${saldoFut < 0 ? '#f87171' : '#4ade80'}">${fmtR(saldoFut)}</span></div>
      </div>
      ${fila > r.saldo ? `<div class="ov-chip">⚠ Déficit: ${fmtR(fila - r.saldo)}</div>` : ''}
    `;
    kpiGrid.appendChild(d);
  });
}

/* ── Stacked Bars ── */
function renderStackedBars() {
  const hbarList = document.getElementById('hbarList');
  DATA.regioes.forEach(r => {
    const L = r.limite;
    const a_total = (Number(r.a_avancar) || 0) + (Number(r.a_novopac) || 0);
    const total = r.executado + a_total + r.selecao;
    const ov = total > L;
    const deficit = total - L;
    const norm = v => ov ? cl(v / total * 100, 0, 100) : cl(v / L * 100, 0, 100);
    const ovPct = ov ? cl((total - L) / L * 100, 0, 20) : 0;
    const s = statusOf(r);
    const clr = SCLR[s];

    const d = document.createElement('div');
    d.innerHTML = `
      <div class="hb-label">
        <span class="hb-name">${r.nome}</span>
        ${ov ? `<div style="color:#f87171;font-size:11px;font-weight:700;margin-top:2px">⚠ Δ Déficit: ${fmtR(deficit)}</div>` : ''}
        <span class="hb-nums">
          Demanda: ${fmtR(total)} | Limite: ${fmtR(L)}
          <b style="color:${clr}">${pct(total, L).toFixed(1)}%</b>
        </span>
      </div>
      <div class="hb-track">
        <div class="hb-seg" style="width:${norm(r.c_avancar)}%;background:#3b82f6;opacity:.85"></div>
        <div class="hb-seg" style="width:${norm(r.c_novopac)}%;background:#22c55e;opacity:.8"></div>
        <div class="hb-seg" style="width:${norm(a_total)}%;background:#f59e0b;opacity:.8"></div>
        <div class="hb-seg" style="width:${norm(r.selecao)}%;background:#a855f7;opacity:.75;${!ov ? 'border-radius:0 6px 6px 0' : ''}"></div>
        ${ov ? `<div class="hb-ov" style="width:${cl(ovPct, 0, 16)}%;border-radius:0 6px 6px 0"></div>` : ''}
        <div class="hb-limit" style="left:${ov ? norm(r.executado) : '99.4'}%"></div>
      </div>
    `;
    hbarList.appendChild(d);
  });
}

/* ── Tabela ── */
function renderTable() {
  const tBody = document.getElementById('tBody');
  DATA.regioes.forEach(r => {
    const s = statusOf(r);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.nome}</td>
      <td>${fmtR(r.limite)}</td>
      <td>${fmtR(r.executado)}</td>
      <td>${fmtR(r.saldo)}</td>
      <td style="font-family:var(--mono)">${pct(r.executado, r.limite).toFixed(2)}%</td>
      <td><span class="badge ${BCLS[s]}">${SLBL[s]}</span></td>
    `;
    tBody.appendChild(tr);
  });

  const totalLim = DATA.regioes.reduce((s, r) => s + r.limite, 0);
  const totalExe = DATA.regioes.reduce((s, r) => s + r.executado, 0);
  const totalSal = totalLim - totalExe;

  document.getElementById('tFoot').innerHTML = `
    <tr>
      <td><b>TOTAL GERAL</b></td>
      <td>${fmtR(totalLim)}</td>
      <td>${fmtR(totalExe)}</td>
      <td>${fmtR(totalSal)}</td>
      <td style="font-family:var(--mono)">${pct(totalExe, totalLim).toFixed(2)}%</td>
      <td>-</td>
    </tr>
  `;
}

/* ── Fila Cards ── */
function renderFilaCards() {
  const filaGrid = document.getElementById('filaGrid');
  DATA.regioes.forEach(r => {
    const a_total = (Number(r.a_avancar) || 0) + (Number(r.a_novopac) || 0);
    const fila = a_total + r.selecao;
    const saldoFut = r.saldo - (r.a_avancar + r.a_novopac + r.selecao);
    const s = statusOf(r);
    const clr = SCLR[s];

    const d = document.createElement('div');
    d.className = 'fila-card';
    d.style.borderTopColor = BTOP[s];
    d.innerHTML = `
      <div class="fila-reg">${r.nome}</div>
      <div class="fila-val" style="color:${clr}">${fmtR(fila)}</div>
      <div class="fila-cnt">Comprometido total: ${fmtR(fila)}</div>
      <div class="fila-div"></div>
      <div class="fila-pl">
        <div class="fila-pr">
          <span class="fl">Avancar</span>
          <span class="fv" style="color:#60a5fa">${fmtR(r.a_avancar)}</span>
        </div>
        <div class="fila-pr">
          <span class="fl">Novo PAC</span>
          <span class="fv" style="color:#4ade80">${fmtR(r.a_novopac)}</span>
        </div>
        <div class="fila-pr">
          <span class="fl">Comprometido / Saldo</span>
          <span class="fv" style="color:${clr}">${pct(fila, r.saldo).toFixed(1)}%</span>
        </div>
        <div class="fila-pr">
          <span class="fl">Margem futura</span>
          <span class="fv" style="color:${saldoFut < 0 ? '#f87171' : '#4ade80'}">${fmtR(saldoFut)}</span>
        </div>
      </div>
      ${fila > r.saldo ? `<div class="ov-chip">Déficit: ${fmtR(fila - r.saldo)}</div>` : ''}
    `;
    filaGrid.appendChild(d);
  });
}

/* ── Reman Cards ── */
function renderRemanCards() {
  const remanDefs = [
    {
      reg: '🔴 Sudeste', cls: 'needs', st: 'Remanejamento Urgente', clr: '#f87171',
      desc: `A fila total soma <b>${fmtR(DATA.regioes[3].a_avancar + DATA.regioes[3].a_novopac + DATA.regioes[3].selecao)}</b>, excedendo o saldo de <b>${fmtR(DATA.regioes[3].saldo)}</b> em <b>${fmtR((DATA.regioes[3].a_avancar + DATA.regioes[3].a_novopac + DATA.regioes[3].selecao) - DATA.regioes[3].saldo)}</b>. O Avancar concentra R$ 1,78 bi do problema. Solicitar remanejamento imediatamente.`
    },
    {
      reg: '🟡 Sul', cls: 'watch', st: 'Monitorar Ativamente', clr: '#fbbf24',
      desc: `Saldo de <b>${fmtR(DATA.regioes[4].saldo)}</b> com fila de <b>${fmtR(DATA.regioes[4].a_avancar + DATA.regioes[4].a_novopac + DATA.regioes[4].selecao)}</b>. Margem futura de <b>${fmtR(DATA.regioes[4].saldo_futuro)}</b>. A Seleção a Publicar (R$ 234,8M) pode virar A Contratar a qualquer momento.`
    },
    {
      reg: '🟡 Centro-Oeste', cls: 'watch', st: 'Monitorar Ativamente', clr: '#fbbf24',
      desc: `Saldo de <b>${fmtR(DATA.regioes[0].saldo)}</b> com fila de <b>${fmtR(DATA.regioes[0].a_avancar + DATA.regioes[0].a_novopac + DATA.regioes[0].selecao)}</b>. Margem futura de <b>${fmtR(DATA.regioes[0].saldo_futuro)}</b>. Dois processos Avancar de grande porte podem pressionar o saldo.`
    },
    {
      reg: '🟢 Nordeste', cls: 'safe', st: 'Saldo Confortável', clr: '#4ade80',
      desc: `Margem futura de <b>${fmtR(DATA.regioes[1].saldo_futuro)}</b>. Baixa pressão sobre o orçamento. <b>Principal candidato a ceder orçamento para o Sudeste via remanejamento.</b>`
    },
    {
      reg: '🟢 Norte', cls: 'safe', st: 'Saldo Confortável', clr: '#4ade80',
      desc: `Margem futura de <b>${fmtR(DATA.regioes[2].saldo_futuro)}</b>. Apenas R$ 2M na fila. Capacidade ociosa elevada — <b>segundo candidato a remanejamento.</b>`
    },
    {
      reg: '📊 Consolidado Geral', cls: '', st: 'Orçamento Global: Monitorar', clr: 'var(--blue-l)',
      desc: `Total de <b>R$ 6,4 bi</b> com saldo global de <b>${fmtR(DATA.totais.saldo)}</b>. O problema é <b>regional</b>: Sudeste concentra demanda excessiva enquanto Norte e Nordeste têm ampla folga. Remanejamento interno resolve sem precisar de crédito adicional.`
    },
  ];

  const remanGrid = document.getElementById('remanGrid');
  remanDefs.forEach(d => {
    const div = document.createElement('div');
    div.className = `reman-card ${d.cls}`;
    div.style.borderTopColor = d.clr;
    div.innerHTML = `
      <div class="reman-reg">${d.reg}</div>
      <div class="reman-st" style="color:${d.clr}">${d.st}</div>
      <div class="reman-desc">${d.desc}</div>
    `;
    remanGrid.appendChild(div);
  });
}

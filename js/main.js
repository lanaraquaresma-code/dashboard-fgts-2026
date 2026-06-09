/* ══ MAIN — Ponto de entrada do dashboard ══ */

document.addEventListener('DOMContentLoaded', () => {
  renderTopbar();
  renderAlertas();
  renderGauge();
  renderKPICards();
  renderStackedBars();
  renderTable();
  renderFilaCards();
  renderRemanCards();

  /* Fechar modal ao clicar no backdrop */
  document.getElementById('uModal').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });
});

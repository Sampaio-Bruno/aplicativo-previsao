export function goToRelatorios() {
  document.querySelector('.homeIcon a[href="/Sistemas/modulo/3"]').click();
}

export function goToDadosAferidos() {
  document.querySelector('a[href="/RelatoriosInfraestruturas/ems_dados_aferidos"]').click();
}

export function startCSVDownload(dataInicial, dataFinal) {
  document.querySelector('#RelatorioEmsDadosAferidosForm').target = '_self';
  document.querySelector('#RelatorioTipoExibicao option[value="CSV"]').selected = true;
  document.querySelector('#RelatorioDataInicial').value = dataInicial;
  document.querySelector('#RelatorioDataFinal').value = dataFinal;

  document.querySelector('#RelatorioEmsDadosAferidosForm').submit();
}

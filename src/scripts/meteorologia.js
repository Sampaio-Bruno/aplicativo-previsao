/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */

// eslint-disable-next-line import/prefer-default-export
export function cadastrarPrevisao(previsaJSON, estado, municipiosJSON, legendasJSON) {
  const previsao = JSON.parse(previsaJSON);
  const municipios = JSON.parse(municipiosJSON.replace(/\*/g, "'"));
  const legendas = JSON.parse(legendasJSON);
  const erros = [];
  let nebulosidade;
  if (legendas.coberturas) nebulosidade = legendas.coberturas[previsao.cobert.toLowerCase()];
  let tempoPre;
  if (previsao.precip) tempoPre = legendas.precipitacaos[previsao.precip.toLowerCase()];

  let vento;
  let varVento;
  const veTemp = previsao.intens.split('/');
  if (veTemp[0]) vento = legendas.ventos[veTemp[0].toLowerCase()];
  if (veTemp[1]) varVento = legendas.ventos[veTemp[1].toLowerCase()];

  let direcVeto;
  let direcVarVeto;
  const direTempo = previsao.direc.split('/');
  if (direTempo[0]) direcVeto = direTempo[0].toUpperCase();
  if (direTempo[1]) direcVarVeto = direTempo[1].toUpperCase();

  document.querySelector('input[id="form:idData_input"]').classList.remove('ui-state-focus');
  document.querySelector('input[id="form:idData_input"]').value = previsao.data;
  document.getElementById('ui-datepicker-div').remove();

  document.querySelector('input[id="form:idNuTemperaturas_input"]').value = previsao.tMin;
  document.querySelector('input[id="form:j_idt47_input"]').value = previsao.tMax;

  if (previsao.tend === 'esta') {
    document
      .querySelector('table[id="form:idNoVariacaoTemperatura"] td:nth-child(3) .ui-radiobutton-box')
      .click();
  } else if (previsao.tend === 'elev') {
    document
      .querySelector('table[id="form:idNoVariacaoTemperatura"] td:nth-child(5) .ui-radiobutton-box')
      .click();
  }

  try {
    // eslint-disable-next-line prefer-destructuring
    document.querySelector('input[id="form:idNuUmidades_input"]').value = previsao.umi.split('/')[0];
  } catch {}

  try {
    // eslint-disable-next-line prefer-destructuring
    document.querySelector('input[id="form:j_idt68_input"]').value = previsao.umi.split('/')[1];
  } catch {}

  // Seleciona a nebulosidade na lista, se o valor foi encontrado
  try {
    if (nebulosidade) {
      document.querySelector('div[id="form:idTempo"] .ui-selectonemenu-trigger').click();
      document.querySelector(`div[id="form:idTempo_panel"] li[data-label="${nebulosidade}"]`).click();
    }
  } catch {}

  // Seleciona o Tempo Presente na lista, se o valor foi encontrado
  try {
    if (tempoPre) {
      document.querySelector('div[id="form:idChuva"] .ui-selectonemenu-trigger').click();
      document.querySelector(`div[id="form:idChuva_panel"] li[data-label="${tempoPre}"]`).click();
    }
  } catch {}

  // Seleciona o vento
  try {
    if (vento) {
      document.querySelector('div[id="form:idVento"] .ui-selectonemenu-trigger').click();
      document.querySelector(`div[id="form:idVento_panel"] li[data-label="${vento}"]`).click();
    }
  } catch {}

  // Seleciona a variação do vento
  try {
    if (varVento) {
      document.querySelector('div[id="form:idVentoVariacao"] .ui-selectonemenu-trigger').click();
      document
        .querySelector(`div[id="form:idVentoVariacao_panel"] li[data-label="${varVento}"]`)
        .click();
    }
  } catch {}

  // Seleciona a direção do vento
  try {
    if (direcVeto) {
      document.querySelector('div[id="form:idDirecaoVento"] .ui-selectonemenu-trigger').click();
      document
        .querySelector(`div[id="form:idDirecaoVento_panel"] li[data-label="${direcVeto}"]`)
        .click();
    }
  } catch {}

  // Seleciona a direção da variação do vento
  try {
    if (direcVarVeto) {
      document
        .querySelector('div[id="form:idDirecaoVentoVariacao"] .ui-selectonemenu-trigger')
        .click();
      document
        .querySelector(`div[id="form:idDirecaoVentoVariacao_panel"] li[data-label="${direcVarVeto}"]`)
        .click();
    }
  } catch {}

  // Seleciona o Estado
  document.querySelector('div[id="form:idEstadoMunicipio"] .ui-selectonemenu-trigger').click();
  document
    .querySelector(`div[id="form:idEstadoMunicipio_panel"] li[data-label="${estado}"]`)
    .click();

  // Tenta selecionar assincronamente os municipios
  let tentativas = 0;
  const interval = window.setInterval(() => {
    const options = document.querySelectorAll('select[id="form:idMunicipiosEstado"] option');
    if (options.length > 0) {
      clearTimeout(interval);
      options.forEach((option) => {
        // eslint-disable-next-line no-param-reassign
        if (municipios.includes(option.innerText)) {
          // eslint-disable-next-line no-param-reassign
          option.selected = 'selected';
        }
      });
      document.querySelector('button[id="form:incluirMunicipios"]').click();
    } else if (tentativas === 10) {
      clearTimeout(interval);
    } else {
      tentativas += 1;
    }
  }, 200);
}

export function salvar(tamanho, automatico) {
  // eslint-disable-next-line no-shadow
  return new Promise((resolve, reject) => {
    try {
      const button = document.createElement('button');
      button.innerText = 'Proximo';
      button.id = 'btn-proximo';
      button.onclick = (evt) => {
        evt.preventDefault();
        resolve();
      };
      const interval = window.setInterval(() => {
        const { length } = document.querySelectorAll('tbody[id="form:dataTableMunicipio_data"] tr');
        if (length === tamanho) {
          if (automatico) document.getElementById('form:btnSalvar').click();
          window.clearInterval(interval);
        }
      }, 500);
      window.setInterval(() => {
        if (!document.querySelector('#btn-proximo')) {
          document.getElementById('form:content_content').append(button);
        }
      }, 500);
      const interval2 = window.setInterval(() => {
        const message = document.querySelector('#messages .ui-messages-info');
        if (message && message.style.display !== 'none') {
          window.clearInterval(interval2);
          resolve();
        }
      }, 500);
    } catch (error) {
      reject(error);
    }
  });
}

export function proximo() {
  // eslint-disable-next-line no-shadow
  return new Promise((resolve, reject) => {
    try {
      const button = document.createElement('button');
      button.innerText = 'Proximo';
      button.id = 'btn-proximo';
      button.onclick = (evt) => {
        evt.preventDefault();
        resolve();
      };
      window.setInterval(() => {
        if (!document.querySelector('#btn-proximo')) {
          document.getElementById('form:content_content').append(button);
        }
      }, 500);
    } catch (error) {
      reject(error);
    }
  });
}

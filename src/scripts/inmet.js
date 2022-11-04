// eslint-disable-next-line import/prefer-default-export
export function getData(estacao, ontem, hoje) {
  const getAutomatica = () => {
    let tMax; let tMin; let uMax; let uMin;
    let pre;
    const table = document.querySelector('#tabela');
    table.querySelectorAll('tbody tr').forEach((tr) => {
      const preAux = parseFloat(tr.querySelector('td:nth-child(19)').textContent.replace(',', '.'), 10);
      if (!pre && !Number.isNaN(preAux)) {
        pre = preAux;
      } else if (preAux > 0) {
        pre += preAux;
      }
      if (tr.querySelector('td:nth-child(1)').textContent === ontem) {
        const tMaxAux = parseFloat(tr.querySelector('td:nth-child(4)').textContent.replace(',', '.'), 10);
        if ((!tMax && tMaxAux) || tMax < tMaxAux) tMax = tMaxAux;
        const uMinAux = parseFloat(tr.querySelector('td:nth-child(8)').textContent.replace(',', '.'), 10);
        if ((!uMin && uMinAux) || uMin > uMinAux) uMin = uMinAux;
      }
      if (tr.querySelector('td:nth-child(1)').textContent === hoje) {
        const uMaxAux = parseFloat(tr.querySelector('td:nth-child(7)').textContent.replace(',', '.'), 10);
        if ((!uMax && uMaxAux) || uMax < uMaxAux) uMax = uMaxAux;
        const tMinAux = parseFloat(tr.querySelector('td:nth-child(5)').textContent.replace(',', '.'), 10);
        if ((!tMin && tMinAux) || tMin > tMinAux) tMin = tMinAux;
      }
    });
    return {
      data: {
        tMin, tMax, uMin, uMax, pre,
      },
    };
  };

  const getConvencional = () => {
    let tMax; let tMin; let uMax; let uMin;
    let pre;
    const table = document.querySelector('#tabela');
    table.querySelectorAll('tbody tr').forEach((tr) => {
      const preAux = parseFloat(tr.querySelector('td:nth-child(12)').textContent.replace(',', '.'), 10);
      if (!pre && !Number.isNaN(preAux)) {
        pre = preAux;
      } else if (preAux > 0) {
        pre += preAux;
      }
      if (tr.querySelector('td:nth-child(1)').textContent === ontem) {
        const tMaxAux = parseFloat(tr.querySelector('td:nth-child(10)').textContent.replace(',', '.'), 10);
        if ((!tMax && tMaxAux) || tMax < tMaxAux) tMax = tMaxAux;
        const uMinAux = parseFloat(tr.querySelector('td:nth-child(4)').textContent.replace(',', '.'), 10);
        if ((!uMin && uMinAux) || uMin > uMinAux) uMin = uMinAux;
      }
      if (tr.querySelector('td:nth-child(1)').textContent === hoje) {
        const uMaxAux = parseFloat(tr.querySelector('td:nth-child(4)').textContent.replace(',', '.'), 10);
        if ((!uMax && uMaxAux) || uMax < uMaxAux) uMax = uMaxAux;
        const tMinAux = parseFloat(tr.querySelector('td:nth-child(11)').textContent.replace(',', '.'), 10);
        if ((!tMin && tMinAux) || tMin > tMinAux) tMin = tMinAux;
      }
    });
    return {
      data: {
        tMin, tMax, uMin, uMax, pre,
      },
    };
  };

  const process = (resolve, reject) => {
    try {
      document.querySelector('#menu').click();
      document.querySelector('#datepicker_EstacoesTabela_Inicio').value = ontem;
      document.querySelector('#datepicker_EstacoesTabela_Fim').value = hoje;
      document.querySelector('#EstacoesTabela').click();

      let tentativas = 0;

      const espera = setInterval(() => {
        if (document.querySelector('.tbodyEstacoes tr')) {
          clearInterval(espera);
          const tipo = document.querySelector('.tipo_estacao option[selected]').value;
          if (tipo === 'T') resolve(getAutomatica());
          if (tipo === 'M') resolve(getConvencional());
        } else if (tentativas > 3) {
          reject(new Error('Dados não encontrados'));
          clearInterval(espera);
        }
        tentativas += 1;
      }, 1000);
    } catch (error) {
      reject(error);
    }
  };

  return new Promise((resolve, reject) => {
    let tentativas = 0;
    const espera = setInterval(() => {
      if (document.querySelector('.tbodyEstacoes tr')) {
        if (document.querySelector('.descTabela').textContent.includes(estacao)) {
          clearInterval(espera);
          process(resolve, reject);
        } else {
          reject(new Error('Estação não encontrada'));
        }
      } else if (tentativas > 3) {
        // Recarrega a página até passar um possível limite de requisições por tempo
        window.location.reload(true);
      } else {
        tentativas += 1;
      }
    }, 1000);
  });
}

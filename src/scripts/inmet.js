// eslint-disable-next-line import/prefer-default-export
export function getData(estacao, ontem, hoje) {
  const getAutomatica = () => {
    let tMax; let tMin; let uMax; let uMin;
    let pre;
    const table = document.querySelector('#root > div.pushable.sidebar-content > div.pusher.wrapped-content > div > div > table');
    table.querySelectorAll('#root > div.pushable.sidebar-content > div.pusher.wrapped-content > div > div > table > tbody tr').forEach((tr) => {
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
    const table = document.querySelector('#root > div.pushable.sidebar-content > div.pusher.wrapped-content > div > div > table');
    table.querySelectorAll('#root > div.pushable.sidebar-content > div.pusher.wrapped-content > div > div > table > tbody tr').forEach((tr) => {
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
      document.querySelector('#root > div.ui.top.attached.header-container.menu > div.left.menu > i').click();
      let tentativas = 0;

      const espera = setInterval(() => {
        if (document.querySelector('#root > div.pushable.sidebar-content > div.ui.vertical.ui.overlay.left.visible.sidebar.menu > div:nth-child(2) > div.ui.compact.buttons')) {
          clearInterval(espera);
          const tipo = document.querySelector('#root > div.pushable.sidebar-content > div.ui.vertical.ui.overlay.left.visible.sidebar.menu > div:nth-child(2) > div.ui.compact.buttons > button.ui.button.btn-active').textContent;
          document.querySelector('#root > div.pushable.sidebar-content > div.ui.vertical.ui.overlay.left.visible.sidebar.menu > div:nth-child(2) > button').click();
          if (tipo === 'Automáticas') setTimeout(resolve(getAutomatica()), 10000);
          if (tipo === 'Convencionais') setTimeout(resolve(getConvencional()), 10000);
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
    document.querySelector('#root > div.ui.top.attached.header-container.menu > div.left.menu > i').click();
    let tentativas = 0;
    let windowre = 0;

    const espera = setInterval(() => {
      if (document.querySelector('#root > div.ui.top.attached.header-container.menu > div.right.menu > span')) {
        if (document.querySelector('#root > div.pushable.sidebar-content > div.pusher.wrapped-content > div > div > div > span').textContent.includes(estacao)) {
          if (document.querySelector('#root > div.pushable.sidebar-content > div.pusher.wrapped-content > div > div > div > span').textContent.includes(ontem)) {
            clearInterval(espera);
            process(resolve, reject);
          }
        } else {
          reject(new Error('Estação não encontrada'));
        }
      } else if (tentativas > 3) {
        // Recarrega a página até passar um possível limite de requisições por tempo
        if (windowre > 3) {
          reject(new Error('Estação não encontrada'));
          alert('Estação não encontrada');
        } else {
          window.location.reload(true);
          windowre += 1;
          alert('recarregou');
          alert(windowre);
        }
      } else {
        tentativas += 1;
      }
    }, 1000);
  });
}

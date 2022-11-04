export function getDataHoje() {
  return new Promise((resolve, reject) => {
    try {
      const cont = 0;
      window.setInterval(() => {
        const tdTMin = document.querySelector(
          '.summary-table tbody tr:nth-child(1) td:nth-child(3)',
        );
        const tdUMax = document.querySelector(
          '.summary-table tbody tr:nth-child(3) td:nth-child(2)',
        );
        const tdPre = document.querySelector(
          '.summary-table tbody tr:nth-child(4) td:nth-child(2)',
        );
        if (tdTMin || tdUMax || tdPre) {
          const tMin = tdTMin ? tdTMin.innerText.replace('°F', '').trim() : '*';
          const uMax = tdUMax ? tdUMax.innerText.replace('%', '').trim() : '*';
          const pre = tdPre ? tdPre.innerText.replace('in', '').trim() : '*';
          resolve({ tMin, uMax, pre });
        } else if (cont > 5) {
          reject(new Error('Página dos dados não carregada'));
        }
      }, 500);
    } catch (error) {
      reject(error);
    }
  });
}

export function getDataOntem() {
  return new Promise((resolve, reject) => {
    try {
      const cont = 0;
      window.setInterval(() => {
        const tdTMax = document.querySelector(
          '.summary-table tbody tr:nth-child(1) td:nth-child(2)',
        );
        const tdUMin = document.querySelector(
          '.summary-table tbody tr:nth-child(3) td:nth-child(3)',
        );
        const tdPre = document.querySelector(
          '.summary-table tbody tr:nth-child(4) td:nth-child(2)',
        );
        if (tdTMax || tdUMin || tdPre) {
          const tMax = tdTMax ? tdTMax.innerText.replace('°F', '').trim() : '*';
          const uMin = tdUMin ? tdUMin.innerText.replace('%', '').trim() : '*';
          const pre = tdPre ? tdPre.innerText.replace('in', '').trim() : '*';
          resolve({ tMax, uMin, pre });
        } else if (cont > 5) {
          reject(new Error('Página dos dados não carregada'));
        }
      }, 500);
    } catch (error) {
      reject(error);
    }
  });
}

function getDataFromResumo() {
  return new Promise((resolve, reject) => {
    /**
     * Procura e returna a cêlula de uma tabela contida em element que
     * constenha a String innerText
     * @param {NodeList} elements lista de elementos DOM a ser pesquisada
     * @param {String} innerText String que será pesquisada dentro dentro dos elementos
     * @returns {Node} O primeiro elemento encontrado ou undefined
     */
    const getByInnerText = (elements, innerText) => {
      const arr = Array.from(elements);
      return arr.find((ele) => ele.innerText === innerText);
    };

    const getByOffsetLeft = (elements, element2) => {
      const arr = Array.from(elements);
      return arr.find((ele) => ele.offsetLeft === element2.offsetLeft);
    };

    // Formatação das strings de data
    const hoje = new Date();
    const ontem = new Date(hoje.getTime() - 86400000);
    const dateOptions = { day: '2-digit', month: '2-digit' };
    const dataInicialShort = ontem.toLocaleDateString(['pt-BR'], dateOptions); // String de data de ontem no formato dd/mm
    const dataFinalShort = hoje.toLocaleDateString(['pt-BR'], dateOptions); // String de data de hoje no formato dd/mm

    // Seleção da tabela de dados climáticos
    const table = document.querySelector('table[bgcolor="#d0d0d0"');
    // Seleção da cêlula de índice da coluna de temperatura máxima
    const tMaxTd = getByInnerText(table.querySelectorAll('th'), 'Max');
    // Seleção da cêlula de índice da coluna de temperatura mínima
    const tMinTd = getByInnerText(table.querySelectorAll('th'), 'Min');
    // Seleção da cêlula de índice da coluna de humidade média
    const uTd = getByInnerText(table.querySelectorAll('th'), 'Hr.\nMed\n(%)');
    // Seleção da cêlula de índice da coluna de precipitação total
    const preTd = getByInnerText(table.querySelectorAll('th'), 'Prec.\n(mm)');

    // Verifica se pelo menus uma das colunas existe
    if (!tMaxTd && !tMinTd && !uTd) {
      reject(new Error('Sem dados para as datas'));
      return undefined;
    }
    // Cria o objeto que a ser retornado
    const result = {};
    // Cria o Array de erros que a ser retornado
    const errs = {};
    // Seleciona a linha da data de ontem
    const tdInicial = getByInnerText(table.querySelectorAll('td'), dataInicialShort);
    const trInicial = tdInicial ? tdInicial.parentNode : undefined;
    // Seleciona a linha da data hoje
    const tdFinal = getByInnerText(table.querySelectorAll('td'), dataFinalShort);
    const trfinal = tdFinal ? tdFinal.parentNode : undefined;

    try {
      if (tMaxTd && trInicial) {
        const tr = getByOffsetLeft(trInicial.querySelectorAll('td'), tMaxTd);
        if (tr && tr.innerText.match(/[0-9.]+/)) {
          result.tMax = tr.innerText;
        }
      }
    } catch (error) {
      errs.push('Erro ao tentar extrair a temperatuda máxima');
    }

    try {
      if (tMinTd && trfinal) {
        const tr = getByOffsetLeft(trfinal.querySelectorAll('td'), tMinTd);
        if (tr && tr.innerText.match(/[0-9.]+/)) {
          result.tMin = tr.innerText;
        }
      }
    } catch (error) {
      errs.push('Erro ao tentar extrair a temperatuda mínima');
    }

    try {
      if (uTd && trfinal) {
        const tr = getByOffsetLeft(trfinal.querySelectorAll('td'), uTd);
        if (tr && tr.innerText.match(/[0-9.]+/)) {
          result.umi = tr.innerText;
        }
      }
    } catch (error) {
      errs.push('Erro ao tentar extrair a umidade');
    }

    try {
      if (preTd && (trfinal || trInicial)) {
        result.pre = 0.0;
        if (trfinal) {
          const tr = getByOffsetLeft(trfinal.querySelectorAll('td'), preTd);
          if (tr && tr.innerText.match(/[0-9.]+/)) {
            result.pre += Number(tr.innerText);
          }
        }
        if (trInicial) {
          const tr = getByOffsetLeft(trInicial.querySelectorAll('td'), preTd);
          if (tr && tr.innerText.match(/[0-9.]+/)) {
            result.pre += Number(tr.innerText);
          }
        }
      }
    } catch (error) {
      errs.push('Erro ao tentar extrair a precipitação');
    }

    resolve({ data: result, errs });
    return undefined;
  });
}

// eslint-disable-next-line import/prefer-default-export
export { getDataFromResumo };

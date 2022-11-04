// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';

const index = [
  'Origem',
  'Uf',
  'Municipio',
  'Cod. Estação',
  'Desc. Estação',
  'Data',
  'Temp. Máx',
  'Temp. Min',
  'Umid. Max',
  'Umid. Min',
  'Precipitação',
];
const attrs = [
  'origem',
  'uf',
  'municipio',
  'cod_estacao',
  'desc_estacao',
  'data',
  'tMax',
  'tMin',
  'uMax',
  'uMin',
  'precipitacao',
];

const validarIndex = (line) => {
  const coluns = line.replace(/"/g, '').split(';');
  if (index.length !== coluns.length) return false;

  let check = true;

  for (let i = 0; i < index.length; i += 1) {
    if (index[i] !== coluns[i]) check = false;
  }

  return check;
};

const scrapLine = (line) => {
  const coluns = line.replace(/"/g, '').split(';');
  if (coluns.length !== index.length) return false;
  const data = {};
  for (let i = 0; i < index.length; i += 1) {
    if (!coluns[i]) return undefined;
    data[attrs[i]] = coluns[i].trim();
  }
  return data;
};

export default class Sipam {
  dados = {};

  constructor() {
    const hoje = new Date();
    const ontem = new Date(hoje.getTime() - 86400000);
    const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    this.dados.dataInicial = ontem.toLocaleDateString(['pt-BR'], dateOptions);
    this.dados.dataFinal = hoje.toLocaleDateString(['pt-BR'], dateOptions);
    this.dados.municipios = [];
  }

  async readData() {
    this.csv = await ipcRenderer.invoke('read-file', 'sipam.csv', { encoding: 'latin1' });
    const lines = this.csv.replace('\r', '').split('\n');
    const firstLine = lines.shift();

    if (!validarIndex(firstLine)) throw new Error('Índice diferente do conhecido');

    for (let i = 0; i < lines.length; i += 1) {
      const object = scrapLine(lines[i]);
      if (object === false) break;
      if (object !== undefined) this.dados.municipios.push(object);
    }
  }

  findByMunicipio(municipio, estado) {
    const dados = this.dados.municipios.filter((x) => {
      const m1 = x.municipio.trim().toLowerCase();
      const m2 = municipio.trim().toLowerCase();
      return m1 === m2 && x.uf === estado;
    });
    if (dados.length > 1) {
      const ontem = dados.find((x) => x.data === this.dados.dataInicial);
      const hoje = dados.find((x) => x.data === this.dados.dataFinal);
      return { ontem, hoje };
    }
    return undefined;
  }

  findById(id) {
    const medicoes = this.dados.municipios.filter((x) => x.cod_estacao === id);
    if (medicoes instanceof Array && medicoes.length > 1) {
      const ontem = medicoes.find((x) => x.data === this.dados.dataInicial);
      const hoje = medicoes.find((x) => x.data === this.dados.dataFinal);
      const tMin = hoje.tMin ? Number(hoje.tMin).toFixed(1) : '*';
      const tMax = ontem.tMax ? Number(ontem.tMax).toFixed(1) : '*';
      const uMin = ontem.uMin ? Number(ontem.uMin).toFixed(1) : '*';
      const uMax = hoje.uMax ? Number(hoje.uMax).toFixed(1) : '*';
      return {
        sitTemp: `${tMin}/${tMax}`,
        sitUmi: `${uMin}/${uMax}`,
        sitPre: (Number(hoje.precipitacao) + Number(ontem.precipitacao)).toFixed(2),
      };
    }
    return undefined;
  }
}

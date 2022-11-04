<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <h3>{{ estado.nome }}</h3>
      </b-col>
    </b-row>
    <!--<b-row>
      <b-col>
        <b-form-textarea
          id="sinotica"
          v-model="estado.sinotica"
          placeholder="Enter something..."
          rows="3"
          max-rows="6"
        ></b-form-textarea>
      </b-col>
    </b-row>-->
    <b-row>
      <b-col>
        <table class="table table-bordered table-sm text-center">
          <thead>
            <tr>
              <th colspan="2"></th>
              <th>
                <button @click="copy"><b-icon icon="clipboard"></b-icon></button>
              </th>
              <th colspan="8">Meteorologista</th>
            </tr>
            <tr>
              <th>Municipios</th>
              <th>Data</th>
              <th>Situação</th>
              <th>Cobertura</th>
              <th>Precip.</th>
              <th>T. Min</th>
              <th>T. Máx</th>
              <th>Tendência</th>
              <th>Umidade</th>
              <th>Intens.</th>
              <th>Direção</th>
            </tr>
          </thead>
          <tbody ref="dadosTbody">
            <template v-for="(regiao, i) of estado.regioes">
              <tr v-for="(previsao, j) of regiao.previsaos" :key="i + previsao.data">
                <td v-if="j == 0" :rowspan="prevDias" class="regiao-titulo">{{ regiao.titulo }}</td>
                <td>{{ previsao.data }}</td>
                <td class="situacao">
                  {{ (regiao[dataIndex[j]] || '*').toString().replace(/\./g, ',') }}
                </td>
                <td><b-input v-model.lazy="previsao.cobert" @paste="paste"></b-input></td>
                <td><b-input v-model.lazy="previsao.precip"></b-input></td>
                <td><b-input v-model.lazy="previsao.tMin"></b-input></td>
                <td><b-input v-model.lazy="previsao.tMax"></b-input></td>
                <td class="tend">
                  <b-form-select v-model.lazy="previsao.tend">
                    <b-form-select-option value="decl">Declínio</b-form-select-option>
                    <b-form-select-option value="esta">Estável</b-form-select-option>
                    <b-form-select-option value="elev">Elevação</b-form-select-option>
                  </b-form-select>
                </td>
                <td><b-input v-model.lazy="previsao.umi"></b-input></td>
                <td><b-input v-model.lazy="previsao.intens"></b-input></td>
                <td><b-input v-model.lazy="previsao.direc"></b-input></td>
              </tr>
            </template>
          </tbody>
        </table>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { clipboard } from 'electron';

const dataIndex = ['sitTemp', 'sitUmi', 'sitPre'];

const agora = new Date();
const diaSec = 86400000;
const dateOptions = { day: '2-digit', month: '2-digit', year: '2-digit' };
export default {
  data() {
    const prevDias = 3;
    const hoje = agora.toLocaleDateString(['pt-BR'], dateOptions);
    this.estado.regioes.forEach((regiao) => {
      let { previsaos } = regiao;
      if (!previsaos) {
        previsaos = [];
        for (let i = 0; i < prevDias; i += 1) {
          previsaos[i] = {
            data: new Date(agora.getTime() + diaSec * (i + 1)).toLocaleDateString(
              ['pt-BR'],
              dateOptions,
            ),
            tend: 'esta',
          };
        }
        // eslint-disable-next-line no-param-reassign
        regiao.previsaos = previsaos;
      }
    });
    return {
      hoje,
      dataIndex,
      prevDias,
    };
  },
  props: ['estado'],
  methods: {
    copy() {
      const dados = [];
      this.$refs.dadosTbody.querySelectorAll('tr .situacao').forEach((x /** index* */) => {
        dados.push(x.innerText);
        // Adiciona a linha em branco que tem nas tabelas originais
        // if ((index + 1) % this.prevDias === 0) {
        // dados.push('');
        // }
      });
      clipboard.writeText(`${dados.join('\n')}`);
    },
    paste(evt) {
      evt.preventDefault();
      const { target } = evt;
      const dados = evt.clipboardData
        .getData('text')
        .split('\n')
        // eslint-disable-next-line no-tabs
        .map((x) => x.split('	'));
      // eslint-disable-next-line no-unused-vars
      let controll = false;
      let i = 0;
      this.$refs.dadosTbody.querySelectorAll('tr').forEach((tr) => {
        let j = 0;
        tr.querySelectorAll('input').forEach((input) => {
          if (input === target) controll = true;
          if (!controll) return;
          if (dados[i].length === j) {
            j = 0;
            i += 1;
          }
          if (controll && dados.length > i && dados[i].length > j) {
            // eslint-disable-next-line no-param-reassign
            input.value = dados[i][j];
            const e = document.createEvent('HTMLEvents');
            e.initEvent('change', true, true);
            input.dispatchEvent(e);
          }
          j += 1;
        });
        if (controll) i += 1;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
tbody tr {
  &:nth-child(2n) {
    background: #eee;
    input,
    select {
      background-color: #eee;
    }
  }
  input,
  select {
    border: none;
    text-align: center;
    border-radius: 0;
  }
}
tbody > tr > td {
  vertical-align: middle;
  padding: 0.1em;
  &.regiao-titulo {
    word-wrap: break-word;
    max-width: 250px;
    min-width: 200px;
  }
  &.tend {
    min-width: 115px;
  }
}
tbody td:focus {
  border-color: #80bdff;
}
</style>

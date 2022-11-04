<template>
  <webview
    id="inmet"
    ref="inmet"
    :src="url"
    v-on:did-finish-load="load"
    v-on:did-fail-load="fail"
  ></webview>
</template>

<script>
// Scripts para inejtar na página da Inmet e obter os dados
import * as inmet from '@/scripts/inmet';

import EventBus from '@/utils/event-bus';

// URL base para as páginas de colsulta da Ogime
const BASEURL = 'https://tempo.inmet.gov.br/TabelaEstacoes';

const isDevelopment = process.env.NODE_ENV !== 'production';

const isEmpty = (object) => !Object.values(object).some((x) => (x !== null && x !== undefined));

export default {
  name: 'Sipam',
  props: ['dataInicial', 'dataFinal', 'params'],
  data() {
    EventBus.$emit('alert', { variant: 'info', mensagem: 'Abrindo Inmet' });
    // Formata a data no formado dd/mm/aaaa
    this.dInicial = this.dataInicial.split('/').reverse().join('/');
    this.dFinal = this.dataFinal.split('/').reverse().join('/');
    // Contador das iterações pela lista de IDs inmet que serão consultadas
    this.current = 0;
    // Array para inserção dos dados coletados
    this.dados = [];
    // Cria se seta a url da primeira consulta
    const url = `${BASEURL}/${this.params[0].inmet[0].toUpperCase()}`;
    return {
      url,
    };
  },
  methods: {
    /**
     * Metodo executado todas as vezes que o loading da webview é completado
     */
    async load() {
      // Abre o devTools para debug
      if (isDevelopment && !this.$refs.inmet.isDevToolsOpened()) this.$refs.inmet.openDevTools();

      let resp;
      try {
        EventBus.$emit('alert', {
          variant: 'info',
          mensagem: `Extraindo os dados de ${this.params[this.current].titulo}`,
        });
        console.log(this.url);
        const id = this.params[this.current].inmet[0].toUpperCase();
        const result = await this.$refs.inmet.executeJavaScript(
          `${inmet.getData}; ${inmet.getData.name}('${id}', '${this.dataInicial}','${this.dataFinal}')`,
        );
        console.log(result);
        resp = result.data;
        if (result.errs && result.errs instanceof Array) {
          resp.errs.forEarch((err) => {
            EventBus.$emit('alert', {
              variant: 'info',
              mensagem: `${this.params[this.current].titulo}: ${err}`,
            });
          });
        }
      } catch (err) {
        EventBus.$emit('alert', {
          variant: 'warning',
          mensagem: `Erro ao extrair os dados de ${this.params[this.current].titulo}`,
        });
      }

      if (resp && !isEmpty(resp)) {
        const tMin = resp.tMin ? Number(resp.tMin).toFixed(1) : '*';
        const tMax = resp.tMax ? Number(resp.tMax).toFixed(1) : '*';
        const uMin = resp.uMin ? Number(resp.uMin).toFixed(1) : '*';
        const uMax = resp.uMax ? Number(resp.uMax).toFixed(1) : '*';
        const pre = resp.pre !== undefined ? Number(resp.pre).toFixed(1) : '*';
        this.dados.push({
          id: this.params[this.current].inmet[0],
          sitTemp: `${tMin}/${tMax}`,
          sitUmi: `${uMin}/${uMax}`,
          sitPre: pre,
        });
      }
      const next = this.current + 1;
      if (next < this.params.length) {
        // Esperar um tempo entre as requisições pois parece ter um limite por minuto
        // setTimeout(() => {
        this.url = `${BASEURL}/${this.params[next].inmet[0].toUpperCase()}`;
        this.current = next;
        // }, 1500);
      } else {
        console.log(this.dados);
        EventBus.$emit('alert', { variant: 'info', mensagem: 'Saindo do Inmet' });
        this.$emit('completo', 'inmet', this.dados);
      }
    },
    async fail(ev) {
      if (ev.validatedURL.includes('https://www.inmet.com/cgi-bin')) {
        EventBus.$emit('alert', {
          variant: 'warning',
          mensagem: `Erro ao extrair os dados de ${this.params[this.current].titulo}`,
        });
        const next = this.current + 1;
        if (next < this.params.length) {
          this.url = this.url.replace(this.params[this.current].inmet, this.params[next].inmet);
          this.current = next;
        } else {
          EventBus.$emit('alert', { variant: 'info', mensagem: 'Saindo do Inmet' });
          this.$emit('completo', 'inmet', this.dados);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#inmet {
  width: 100%;
  height: 100%;
}
</style>

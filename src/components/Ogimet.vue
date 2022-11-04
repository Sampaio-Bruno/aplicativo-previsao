<template>
  <webview
    id="ogimet"
    ref="ogimet"
    :src="url"
    v-on:did-stop-loading="load"
    v-on:did-fail-load="fail"
  ></webview>
</template>

<script>
// Transforma um objeto em uma url query
import { stringify } from 'querystring';
// Scripts para inejtar na página da Ogimet e obter os dados
import * as ogimet from '@/scripts/ogimet';

import EventBus from '@/utils/event-bus';

// URL base para as páginas de colsulta da Ogime
const baseURL = 'https://www.ogimet.com/cgi-bin/gsynres?ndays=2&hora=12&ord=REV&enviar=Ver';

const isDevelopment = process.env.NODE_ENV !== 'production';

export default {
  name: 'Sipam',
  props: ['dataInicial', 'dataFinal', 'params'],
  data() {
    EventBus.$emit('alert', { variant: 'info', mensagem: 'Abrindo Ogimet' });
    // Tranforma a data atual em um Array para usar de forma separada [dd,mm,aaaa]
    const arrData = this.dataFinal.split('/');
    // Contador das iterações pela lista de IDs ogimet que serão consultadas
    this.current = 0;
    // Array para inserção dos dados coletados
    this.dados = [];
    // Cria o obejto para gerar a query da primeria consulta ao Ogimet
    const urlParns = {
      ano: arrData[2],
      mes: arrData[1],
      dia: arrData[0],
      ind: this.params[0].ogimet,
    };
    // Cria se seta a url da primeira consulta
    const url = `${baseURL}&${stringify(urlParns)}`;
    return {
      url,
    };
  },
  mounted() {
    window.addEventListener('keydown', this.refresh);
  },
  methods: {
    /**
     * Metodo executado todas as vezes que o loading da webview é completado
     */
    async load() {
      // Abre o devTools para debug
      if (isDevelopment && !this.$refs.ogimet.isDevToolsOpened()) this.$refs.ogimet.openDevTools();

      let resp;
      try {
        EventBus.$emit('alert', {
          variant: 'info',
          mensagem: `Extraindo os dados de ${this.params[this.current].titulo}`,
        });
        const result = await this.$refs.ogimet.executeJavaScript(
          `${ogimet.getDataFromResumo}; ${ogimet.getDataFromResumo.name}()`,
        );
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

      if (resp) {
        const tMin = resp.tMin ? Number(resp.tMin).toFixed(1) : '*';
        const tMax = resp.tMax ? Number(resp.tMax).toFixed(1) : '*';
        const umi = resp.umi ? Number(resp.umi).toFixed(1) : '*';
        const pre = resp.pre !== undefined ? Number(resp.pre).toFixed(1) : '*';
        this.dados.push({
          id: this.params[this.current].ogimet,
          sitTemp: `${tMin}/${tMax}`,
          sitUmi: umi,
          sitPre: pre,
        });
      }
      const next = this.current + 1;
      if (next < this.params.length) {
        this.url = this.url.replace(this.params[this.current].ogimet, this.params[next].ogimet);
        this.current = next;
      } else {
        EventBus.$emit('alert', { variant: 'info', mensagem: 'Saindo do Ogimet' });
        this.$emit('completo', 'ogimet', this.dados);
      }
    },
    async fail(ev) {
      if (ev.validatedURL.includes('https://www.ogimet.com/cgi-bin')) {
        EventBus.$emit('alert', {
          variant: 'warning',
          mensagem: `Erro ao extrair os dados de ${this.params[this.current].titulo}`,
        });
        const next = this.current + 1;
        if (next < this.params.length) {
          this.url = this.url.replace(this.params[this.current].ogimet, this.params[next].ogimet);
          this.current = next;
        } else {
          EventBus.$emit('alert', { variant: 'info', mensagem: 'Saindo do Ogimet' });
          this.$emit('completo', 'ogimet', this.dados);
        }
      }
    },
    refresh(event) {
      if (event.key === 'F4') {
        this.$refs.ogimet.reload();
      }
    },
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.refresh);
  },
};
</script>

<style lang="scss" scoped>
#ogimet {
  width: 100%;
  height: 100%;
}
</style>

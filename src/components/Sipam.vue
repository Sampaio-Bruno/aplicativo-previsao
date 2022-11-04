<template>
  <webview
    id="sipam"
    ref="sipam"
    src="http://172.20.4.220"
    v-on:did-finish-load="load"
    v-on:did-fail-load="fail"
  ></webview>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import * as sipam from '@/scripts/sipam';
import EventBus from '@/utils/event-bus';

const isDevelopment = process.env.NODE_ENV !== 'production';

export default {
  name: 'Sipam',
  props: ['dataInicial', 'dataFinal'],
  data() {
    EventBus.$emit('alert', { variant: 'info', mensagem: 'Abrindo sistema interno do Sipam' });
    return {
      tentativas: 0,
    };
  },
  methods: {
    load() {
      const sipamviW = this.$refs.sipam;
      // Abre o devTools para debug
      if (isDevelopment && !sipamviW.isDevToolsOpened()) sipamviW.openDevTools();

      if (sipamviW.getURL() === 'http://172.20.4.220/Sistemas/modulo') this.afterLogin();
      if (sipamviW.getURL() === 'http://172.20.4.220/Sistemas/home') this.afterModulo3();
      if (sipamviW.getURL() === 'http://172.20.4.220/RelatoriosInfraestruturas/ems_dados_aferidos') this.baixarRelatorio();
    },

    baixarRelatorio() {
      EventBus.$emit('alert', { variant: 'info', mensagem: 'Baixando relatórios' });
      const sipamviW = this.$refs.sipam;
      sipamviW.executeJavaScript(
        `${sipam.startCSVDownload}; ${sipam.startCSVDownload.name}('${this.dataInicial}', '${this.dataFinal}')`,
      );
      ipcRenderer.once('download', (event, arg) => {
        if (arg === 'end') this.$emit('completo', 'sipam');
      });
    },
    afterModulo3() {
      const sipamviW = this.$refs.sipam;
      sipamviW.executeJavaScript(`${sipam.goToDadosAferidos}; ${sipam.goToDadosAferidos.name}()`);
    },
    afterLogin() {
      const sipamviW = this.$refs.sipam;
      sipamviW.executeJavaScript(`${sipam.goToRelatorios}; ${sipam.goToRelatorios.name}()`);
    },
    fail() {
      const sipamviW = this.$refs.sipam;
      if (this.tentativas > 0) {
        EventBus.$emit('alert', {
          variant: 'warning',
          mensagem: 'Não foi possível obter os dados do do Sipam',
        });
        this.$emit('fail', 'sipam');
      } else {
        EventBus.$emit('alert', {
          variant: 'warning',
          mensagem: 'Erro ao tentar abrir o Sipam, tentando novamente...',
        });
        sipamviW.reload();
        this.tentativas += 1;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#sipam {
  width: 100%;
  height: 100%;
}
</style>

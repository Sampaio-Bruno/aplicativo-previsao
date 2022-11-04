<template>
  <webview id="wunderground" :src="url" ref="wunderground" v-on:did-finish-load="load"></webview>
</template>

<script>
import * as wunderground from '@/scripts/wunderground';
import EventBus from '@/utils/event-bus';

const hoje = new Date().toISOString().split('T')[0];
const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const createURL = (sensor, data) => `https://www.wunderground.com/dashboard/pws/${sensor}/graph/${data}/${data}/daily`;

const isDevelopment = process.env.NODE_ENV !== 'production';

export default {
  name: 'Wunderground',
  props: ['params'],
  data() {
    EventBus.$emit('alert', { variant: 'info', mensagem: 'Abrindo o Wunderground' });
    return {
      url: createURL(this.params[0].wunderground, hoje),
      countRegiao: 0,
      isHoje: true,
      loading: true,
      dados: [],
    };
  },
  methods: {
    async load() {
      const wundergroundW = this.$refs.wunderground;
      // Abre o devTools para debug
      if (isDevelopment && !wundergroundW.isDevToolsOpened()) wundergroundW.openDevTools();

      if (this.isHoje && this.loading) {
        this.loading = false;
        EventBus.$emit('alert', {
          variant: 'info',
          mensagem: `Extraindo os dados de ${this.params[this.countRegiao].titulo} de hoje.`,
        });
        const resp = await wundergroundW.executeJavaScript(
          `${wunderground.getDataHoje}; ${wunderground.getDataHoje.name}()`,
        );
        const tMin = resp.tMin ? ((Number(resp.tMin) - 32) / 1.8).toFixed(1) : '*';
        const uMax = resp.uMax ? Number(resp.uMax).toFixed(1) : '*';
        const pre = resp.pre !== undefined ? Number(resp.pre) * 25.4 : '*';
        this.dados[this.countRegiao] = {
          wunderground: this.params[this.countRegiao].wunderground,
          tMin,
          uMax,
          pre,
        };
        this.isHoje = false;
        this.loading = true;
        wundergroundW.loadURL(createURL(this.params[this.countRegiao].wunderground, ontem));
      } else if (this.loading) {
        this.loading = false;
        EventBus.$emit('alert', {
          variant: 'info',
          mensagem: `Extraindo os dados de ${this.params[this.countRegiao].titulo} de ontem.`,
        });
        const resp = await wundergroundW.executeJavaScript(
          `${wunderground.getDataOntem}; ${wunderground.getDataOntem.name}()`,
        );
        const tMax = resp.tMax ? ((Number(resp.tMax) - 32) / 1.8).toFixed(1) : '*';
        const uMin = resp.uMin ? Number(resp.uMin).toFixed(1) : '*';
        const pre = resp.pre !== undefined ? Number(resp.pre) * 25.4 : '*';
        this.dados[this.countRegiao].tMax = tMax;
        this.dados[this.countRegiao].uMin = uMin;
        this.dados[this.countRegiao].pre += pre;
        this.countRegiao += 1;
        if (this.countRegiao < this.params.length) {
          this.isHoje = true;
          this.loading = true;
          wundergroundW.loadURL(createURL(this.params[this.countRegiao].wunderground, hoje));
        } else {
          const result = this.dados.map((x) => ({
            wunderground: x.wunderground,
            sitTemp: `${x.tMin}/${x.tMax}`,
            sitUmi: `${x.uMin}/${x.uMax}`,
            sitPre: x.pre.toFixed(2),
          }));
          this.$emit('completo', 'wunderground', result);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#wunderground {
  width: 100%;
  height: 100%;
}
</style>

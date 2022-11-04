<template>
  <b-container fluid>
    <b-row class="webview">
      <webview
        id="meteorologia"
        ref="meteorologia"
        :src="url"
        v-on:did-finish-load="load"
      ></webview>
    </b-row>
    <b-row class="rodape">
      <b-progress height="24px" :value="100" variant="primary" :label="atual" animated>
      </b-progress>
      <div class="progress-text">{{ atual }}</div>
    </b-row>
  </b-container>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import * as meteorologia from '@/scripts/meteorologia';
import * as legendas from '@/models/legendas';

const baseURL = 'https://aplicativos.sipam.gov.br/portalmeteorologia/';
const cadastroURL = 'https://aplicativos.sipam.gov.br/portalmeteorologia/pages/seguro/previsaotempo/cadastrarPrevisaoTempo.jsf';

const isDevelopment = process.env.NODE_ENV !== 'production';

export default {
  name: 'Sipam',
  props: ['dataInicial', 'dataFinal', 'params', 'automatico'],
  data() {
    this.countI = 0;
    this.countJ = 0;
    this.controle = 'deslogado';
    return {
      url: baseURL,
      atual: 'Preparando...',
      erro: '',
      animate: true,
    };
  },
  methods: {
    async load() {
      const meteorologiaW = this.$refs.meteorologia;

      // Abre o devTools para debug
      if (isDevelopment && !meteorologiaW.isDevToolsOpened()) meteorologiaW.openDevTools();

      // Procura pelo formulário de login
      const loginInput = await meteorologiaW.executeJavaScript(
        'document.querySelector("#form_login input.ui-inputfield")?true:false',
      );
      if (loginInput) {
        if (meteorologiaW.getURL() !== baseURL) meteorologiaW.loadURL(baseURL);
      } else if (this.controle === 'deslogado') {
        this.controle = 'abrircadastro';
      }

      if (this.controle === 'abrircadastro') {
        meteorologiaW.loadURL(cadastroURL);
        this.controle = 'cadastrar';
      }

      if (this.controle === 'cadastrar') {
        this.cadastrar();
        this.controle = 'salvar';
      }

      if (this.controle === 'salvar') {
        const regiao = this.params.regioes[this.countI];
        this.controle = 'proximo';
        await meteorologiaW.executeJavaScript(
          `${meteorologia.salvar}; ${meteorologia.salvar.name}(${regiao.municipios.length}, ${this.automatico})`,
        );
        console.log('proximo', this.countJ);
        this.proximo();
      }

      if (this.controle === 'proximo') {
        await meteorologiaW.executeJavaScript(`${meteorologia.proximo}; ${meteorologia.proximo.name}()`);
        this.proximo();
      }
    },
    proximo() {
      const meteorologiaW = this.$refs.meteorologia;
      const regiao = this.params.regioes[this.countI];
      if (this.countJ + 1 < regiao.previsaos.length) {
        this.countJ += 1;
        this.controle = 'cadastrar';
        meteorologiaW.loadURL(cadastroURL);
      } else if (this.countI + 1 < this.params.regioes.length) {
        this.countI += 1;
        this.countJ = 0;
        meteorologiaW.loadURL(cadastroURL);
        this.controle = 'cadastrar';
      } else {
        this.$emit('completo', 'salvar', this.dados);
      }
    },
    async cadastrar() {
      const meteorologiaW = this.$refs.meteorologia;
      const regiao = this.params.regioes[this.countI];
      const fn = meteorologia.cadastrarPrevisao;
      const fnName = meteorologia.cadastrarPrevisao.name;
      const previsao = regiao.previsaos[this.countJ];
      this.controle = 'salvar';
      this.atual = `${regiao.titulo.split('–')[0].toLowerCase()} - ${previsao.data} `;
      const municipios = JSON.stringify(regiao.municipios).replace(/'/g, '*');
      await meteorologiaW.executeJavaScript(`
        ${fn};
        ${fnName}(
          '${JSON.stringify(previsao)}',
          '${this.params.nome}',
          '${municipios}',
          '${JSON.stringify(legendas)}'
        )`);
    },
  },
};
</script>

<style lang="scss" scoped>
.container-fluid {
  height: 100vh;
  .webview {
    height: calc(100vh - 24px);
  }
  .rodape {
    text-transform: capitalize;
    .progress {
      width: 100%;
    }
    .progress-text {
      width: 100%;
      margin-top: -24px;
      text-align: center;
    }
  }
}
#meteorologia {
  width: 100%;
  height: 100%;
}
</style>

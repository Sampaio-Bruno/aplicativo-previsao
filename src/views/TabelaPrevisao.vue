<template>
  <div>
    <Tabela :key="estadoAtual.key" v-bind:estado="estadoAtual" v-show="!fonte"></Tabela>
    <component
      v-bind:is="fonte"
      v-on:completo="loadingEnd"
      v-on:fail="loadingFail"
      v-bind:dataInicial="dataInicial"
      v-bind:dataFinal="dataFinal"
      v-bind:params="params"
      v-bind:automatico="automatico"
    >
    </component>
  </div>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import path from 'path';
import Sipam from '@/components/Sipam.vue';
// import Inmet from '@/components/Inmet.vue';
import Ogimet from '@/components/Ogimet.vue';
import Wunderground from '@/components/Wunderground.vue';
import Tabela from '@/components/Tabela.vue';
import Meteorogia from '@/components/Meteorologia.vue';
import SipamModel from '@/models/sipam-model';
import estadosDef from '@/config/estados.json';

// Data de hoje
const hoje = new Date();
// Data de ontem
const ontem = new Date(hoje.getTime() - 86400000);
// Configuração para formatação da data
const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
// Nome do arquivo salvo para os dados de hoje
const fileName = `${hoje.toISOString().split('T')[0]}.json`;

// Insere os dados obtidos do sipam no array de dados de previsão
const makeSipam = async (estados) => {
  const sipamModel = new SipamModel();
  // Lê assincronamente os dados salvos no CSV
  await sipamModel.readData();
  estados.forEach((estado) => {
    estado.regioes.forEach((regiao) => {
      regiao.sipams.forEach((id) => {
        const dados = sipamModel.findById(id);
        if (dados) {
          // eslint-disable-next-line no-param-reassign
          if (!regiao.sitTemp || regiao.sitTemp === '*') regiao.sitTemp = dados.sitTemp;
          // eslint-disable-next-line no-param-reassign
          if (!regiao.sitUmi || regiao.sitUmi === '*') regiao.sitUmi = dados.sitUmi;
          // eslint-disable-next-line no-param-reassign
          if (!regiao.sitPre || regiao.sitPre === '*') regiao.sitPre = dados.sitPre;
        }
      });
    });
    // eslint-disable-next-line no-param-reassign
    estado.key = `${estado.uf}-2`;
  });
};

// Insere os dados obtidos do Ogimet no array de dados de previsão

// Insere os dados obtidos do Ogimet no array de dados de previsão
const makeOgimet = (dadosArray, estados) => {
  estados.forEach((estado) => {
    estado.regioes.forEach((regiao) => {
      if (!regiao.ogimet) return;
      const dados = dadosArray.find((x) => x.id.toString() === regiao.ogimet);
      if (dados) {
        // eslint-disable-next-line no-param-reassign
        if (!regiao.sitTemp || regiao.sitTemp === '*') regiao.sitTemp = dados.sitTemp;
        // eslint-disable-next-line no-param-reassign
        if (!regiao.sitUmi || regiao.sitUmi === '*') regiao.sitUmi = dados.sitUmi;
        // eslint-disable-next-line no-param-reassign
        if (!regiao.sitPre || regiao.sitPre === '*') regiao.sitPre = dados.sitPre;
      }
    });
    // eslint-disable-next-line no-param-reassign
    estado.key = `${estado.uf}-3`;
  });
};

// Insere os dados obtidos do Wunderground no array de dados de previsão
const makeWunderground = (dadosArray, estados) => {
  estados.forEach((estado) => {
    estado.regioes.forEach((regiao) => {
      if (!regiao.wunderground) return;
      const dados = dadosArray.find((x) => x.wunderground.toString() === regiao.wunderground);
      if (dados) {
        // eslint-disable-next-line no-param-reassign
        if (!regiao.sitTemp || regiao.sitTemp === '*') regiao.sitTemp = dados.sitTemp;
        // eslint-disable-next-line no-param-reassign
        if (!regiao.sitUmi || regiao.sitUmi === '*') regiao.sitUmi = dados.sitUmi;
        // eslint-disable-next-line no-param-reassign
        if (!regiao.sitPre || regiao.sitPre === '*') regiao.sitPre = dados.sitPre;
      }
    });
    // eslint-disable-next-line no-param-reassign
    // estado.key = `${estado.uf}-3`;
  });
};

export default {
  /**
   * Constroi e envia para o menu princial a lista de submenus desse componente
   */
  beforeMount() {
    this.submenu = [
      { id: 'changeAutomatico', name: 'Automático', tipo: 'metodo' },
      { id: 'obterDados', name: 'Obter dados', tipo: 'metodo' },
      { id: 'cadastrar', name: 'Cadastrar dados', tipo: 'metodo' },
    ];
    // Controle do estado atualmente ativo
    let active = true;
    // Itera sobre a lista de estados e cria respectivos submenus
    this.estados.forEach((estado) => {
      this.submenu.push({
        id: estado.uf,
        name: estado.nome,
        tipo: 'estado',
        active,
      });
      active = false;
    });
    // Emite o sinal e envia o submenu para o component com o menu principal
    this.$emit('update-menu', this.submenu);
    ipcRenderer
      .invoke('read-file', path.join('dados', fileName), { encoding: 'utf8' })
      .then((data) => {
        this.estados = JSON.parse(data);
        // eslint-disable-next-line prefer-destructuring
        this.estadoAtual = this.estados[0];
      });
  },
  data() {
    return {
      estados: estadosDef,
      estadoAtual: estadosDef[0],
      loading: false,
      sipamShow: false,
      fonte: null,
      params: [],
      automatico: true,
      dataInicial: ontem.toLocaleDateString(['pt-BR'], dateOptions),
      dataFinal: hoje.toLocaleDateString(['pt-BR'], dateOptions),
    };
  },
  components: { Sipam, Tabela },
  methods: {
    /**
     * Processa o click vindo do componente pai
     * @param {Object} item Item do menu
     * @param {string} item.id Identificador e ação do item do menu
     * @param {string} item.name O nome do item do menu
     * @param {string} item.tipo O tipo do item do menu (estado ou metodo)
     * @param {Boolean} item.active Estado o item do menu
     */
    clickSubmenu(item) {
      if (item.tipo === 'estado') {
        const estado = this.estados.find((est) => est.uf === item.id);
        if (estado) this.estadoAtual = estado;
        this.submenu.forEach((subm) => {
          if (subm.tipo === 'estado') {
            // eslint-disable-next-line no-param-reassign
            subm.active = false;
          }
        });
        // eslint-disable-next-line no-param-reassign
        item.active = true;
      } else if (item.tipo === 'metodo') {
        if (typeof this[item.id] !== 'function') return;
        this[item.id].call(this, item);
      }
    },
    /**
     * Muda o estádo de processamento automático de cadastro
     * @param {Object} item Item do menu
     * @param {string} item.id Identificador e ação do item do menu
     * @param {string} item.name O nome do item do menu
     * @param {string} item.tipo O tipo do item do menu (estado ou metodo)
     * @param {Boolean} item.active Estado o item do menu
     */
    changeAutomatico(item) {
      if (item.name === 'Automático') {
        // eslint-disable-next-line no-param-reassign
        item.name = 'Revisado';
        this.automatico = false;
      } else {
        // eslint-disable-next-line no-param-reassign
        item.name = 'Automático';
        this.automatico = true;
      }
    },
    /**
     * Método executado toda vez que uma fonte de dados retorna alguma informação
     * @param {string} fonte Identificador de fonte de dados
     * @param {Array} fonte Identificador de fonte de dados
     */
    async loadingEnd(fonte, dados) {
      this.loading = false;
      this.fonte = null;
      console.log(fonte, dados);
      switch (fonte) {
        case 'sipam':
          makeSipam(this.estados);
          this.ogimet();
          break;
        case 'ogimet':
          makeOgimet(dados, this.estados);
          this.wunderground();
          break;
        case 'wunderground':
          makeWunderground(dados, this.estados);
          break;
        default:
          break;
      }
      this.salvar();
    },

    /**
     * Método executado toda vez que uma fonte de dados falha
     * @param {string} fonte Identificador de fonte de dados
     * @param {Array} fonte Identificador de fonte de dados
     */
    async loadingFail(fonte) {
      this.loading = false;
      this.fonte = null;
      switch (fonte) {
        case 'sipam':
          this.ogimet();
          break;
        case 'ogimet':
          this.wunderground();
          break;
        default:
          break;
      }
    },
    /**
     * Inicia o processo de obtenção dos dados das fontes cadastradas
     */
    async obterDados() {
      this.loading = true;
      this.fonte = Sipam;
    },

    /**
     * Prepara os identificadores para obtenção dos dados da Ogimet
     */

    /**
     * Prepara os identificadores para obtenção dos dados da Ogimet
     */
    async ogimet() {
      const params = this.estados.reduce((arr1, estado) => {
        const regioes = estado.regioes.reduce((arr2, regiao) => {
          if (regiao.ogimet) arr2.push({ titulo: regiao.titulo, ogimet: regiao.ogimet });
          return arr2;
        }, []);
        return arr1.concat(regioes);
      }, []);
      this.params = params;
      this.fonte = Ogimet;
    },
    /**
     * Prepara os identificadores para obtenção dos dados da Wunderground
     */
    async wunderground() {
      const params = this.estados.reduce((arr1, estado) => {
        const regioes = estado.regioes.reduce((arr2, regiao) => {
          if (regiao.wunderground) {
            arr2.push({
              titulo: regiao.titulo,
              wunderground: regiao.wunderground,
            });
          }
          return arr2;
        }, []);
        return arr1.concat(regioes);
      }, []);
      this.params = params;
      this.fonte = Wunderground;
    },
    /**
     * Inicia o processo da cadastro das previsões no portalmeteorologia
     */
    async cadastrar() {
      this.params = this.estadoAtual;
      this.fonte = Meteorogia;
    },
    async salvar() {
      ipcRenderer.invoke('write-file', path.join('dados', fileName), this.estados).catch((err) => {
        console.log(err);
      });
    },
  },
  watch: {
    estados: {
      deep: true,
      handler() {
        this.salvar();
      },
    },
  },
};
</script>

<style lang="scss" scoped>
nav {
  position: fixed;
  right: 0;
  bottom: 0;
  ul {
    list-style: none;
    margin: 0;
    li {
      display: inline;
      margin: 0.2em;
    }
  }
}
.modal-body {
  height: 100%;
}
</style>

<template>
  <div id="app">
    <router-view id="main" ref="main" v-on:update-menu="updateMenu" />
    <nav>
      <b-nav vertical pills>
        <b-nav-item to="/" exact exact-active-class="active">
          <b-icon icon="list" aria-hidden="true"></b-icon> Inicio
        </b-nav-item>
        <b-nav-item to="/tabela" exact exact-active-class="active">
          <b-icon icon="table" aria-hidden="true"></b-icon> Tabela
        </b-nav-item>
        <!--
        <b-nav-item to="/mapa" exact exact-active-class="active">
          <b-icon icon="map" aria-hidden="true"></b-icon> Mapa
        </b-nav-item>
        <b-nav-item to="/email" exact exact-active-class="active">
          <b-icon icon="mailbox" aria-hidden="true"></b-icon> Email
        </b-nav-item>
        -->
      </b-nav>
      <b-nav class="subnav" vertical pills>
        <b-nav-item
          v-for="item in submenu"
          :key="item.id"
          :active="item.active"
          @click="clickSubmenu(item)"
        >
          {{ item.name }}
        </b-nav-item>
      </b-nav>
    </nav>
    <Alert></Alert>
  </div>
</template>

<script>
import Alert from '@/components/Alert.vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';

export default {
  components: { Alert },
  beforeMount() {
    document.addEventListener('keydown', (e) => {
      if (e.which === 123) {
        ipcRenderer.send('toogle-devtools');
      } else if (e.which === 116) {
        document.location.reload();
      }
    });
  },
  data() {
    return {
      submenu: [],
    };
  },
  methods: {
    /**
     * Atualiza o submenu geral
     * @param {Object[]} submenu - A lista de itens do submenu
     * @param {string} submenu[].id - O identificador único
     * @param {string} submenu[].name - O nome a ser exibino na interface
     */
    updateMenu(submenu) {
      this.submenu = submenu;
    },

    /**
     * Delega a ação de clicque no submenu para o compomente atual
     * @param {Object[]} submenu - A lista de itens do submenu
     * @param {string} submenu[].id - O identificador único
     * @param {string} submenu[].name - O nome a ser exibino na interface
     */
    clickSubmenu(item) {
      this.$refs.main.clickSubmenu(item);
    },
  },
};
</script>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap.scss';
@import 'node_modules/bootstrap-vue/src/index.scss';

html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
}

#app {
  display: flex;
  flex-direction: row;
  position: relative;
  height: 100%;
}

#app > nav {
  height: 100%;
  background: #2c3e50;
  width: 260px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  a {
    color: #fff;
  }
}
.subnav {
  margin-top: auto;
}
#main {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.modal-body {
  height: 100vh;
}
</style>

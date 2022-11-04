import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import TabelaPrevisao from '../views/TabelaPrevisao.vue';
import Mapa from '../views/Mapa.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/tabela',
    name: 'TabelaPrevisao',
    component: TabelaPrevisao,
  },
  {
    path: '/mapa',
    name: 'Mapa',
    component: Mapa,
  },
];

const router = new VueRouter({
  routes,
});

export default router;

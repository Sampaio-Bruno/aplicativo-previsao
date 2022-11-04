<template>
  <b-container fluid>
    <b-row>
      <b-col><h2>Mapa</h2></b-col>
    </b-row>
    <b-row>
      <b-col><canvas></canvas></b-col>
      <b-col>
        <b-row>
          <b-col><h3>Menu</h3></b-col>
        </b-row>
        <b-row>
          <b-col><img :src="iconpath"/></b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-select v-model="iconSelected">
              <b-form-select-option v-for="(icon, key) in icons" :key="key" :value="icon">{{
                icon
              }}</b-form-select-option>
            </b-form-select>
          </b-col>
        </b-row>
        <b-row>
          <b-col>Menu</b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import path from 'path';
import icons from '@/models/icons';

export default {
  beforeMount() {
    this.submenu = [
      {
        id: 'AC',
        name: 'Acre',
        tipo: 'estado',
        active: true,
      },
      { id: 'MT', name: 'Mato Grosso', tipo: 'estado' },
      { id: 'RO', name: 'Rondônia', tipo: 'estado' },
    ];
    this.$emit('update-menu', this.submenu);
  },
  data() {
    return {
      iconSelected: icons[0],
      icons,
    };
  },
  methods: {
    clickSubmenu(item) {
      if (item.tipo === 'estado') this.trocaEstado(item);
    },
    trocaEstado(estado) {
      this.submenu.forEach((element) => {
        if (element.tipo === 'estado') {
          // eslint-disable-next-line no-param-reassign
          element.active = false;
        }
      });
      // eslint-disable-next-line no-param-reassign
      estado.active = true;
      console.log(this.submenu);
    },
  },
  computed: {
    iconpath() {
      return path.join(process.env.BASE_URL, 'icones-mapa', `${this.iconSelected}.png`);
    },
  },
};
</script>

<style></style>

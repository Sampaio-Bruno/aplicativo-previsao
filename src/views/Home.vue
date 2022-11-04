<template>
  <b-container fluid>
  <b-row>
    <b-col>
      <b-table ref="table"
      striped hover per-page="20"
      :busy.sync="isBusy"
      :items="previsaos"
      :fields="fields">
        <template #cell(index)="data">
          {{ data.index + 1 }}
        </template>
        <template #cell(editar)="data">
          <b-button variant="primary" @click="editar(data.item.data)" size="sm">Editar</b-button>
        </template>
        <template #cell(deletar)="data">
          <b-button variant="danger" @click="deletar(data.item.data)" size="sm">Deletar</b-button>
        </template>
      </b-table>
    </b-col>
  </b-row>
  </b-container>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { join } from 'path';

export default {
  beforeMount() {
    this.$emit('update-menu', []);
  },
  data() {
    return {
      isBusy: false,
      fields: [{ key: 'index', label: 'Índice' }, 'data', 'editar', 'deletar'],
      prevs: [],
    };
  },
  methods: {
    async previsaos() {
      this.isBusy = true;
      try {
        const files = await ipcRenderer.invoke('read-dir', 'dados');
        const result = files.map((x) => ({ data: x.replace('.json', '') })).reverse();
        this.isBusy = false;
        this.prevs = result;
        return this.prevs;
      } catch (error) {
        this.isBusy = false;
        return [];
      }
    },
    editar(previsao) {
      console.log('previsao', previsao);
    },
    async deletar(previsao) {
      try {
        await ipcRenderer.invoke('remove-file', join('dados', `${previsao}.json`));
        this.$refs.table.refresh();
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style>

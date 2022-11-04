<template>
  <div id="alert-box">
    <b-button variant="warning" v-show="alertas.length > 1" @click="alertas = []"
      >Fechar tudo</b-button
    >
    <b-alert
      v-for="alerta in alertas"
      :key="alerta.id"
      show
      fade
      dismissible
      :variant="alerta.variant"
      v-on:dismissed="dismissed(alerta)"
    >
      {{ alerta.mensagem }}
    </b-alert>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

import EventBus from '@/utils/event-bus';

export default {
  data() {
    EventBus.$on('alert', (alerta) => this.addAlert(alerta));
    return {
      alertas: [],
    };
  },
  methods: {
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },
    showAlert() {
      this.dismissCountDown = this.dismissSecs;
    },
    addAlert(alerta) {
      while (this.alertas.length > 5) {
        const firstInfo = this.alertas.find((ale) => ale.variant === 'info');
        if (firstInfo) this.dismissed(firstInfo);
        else this.alertas.shift();
      }
      this.alertas.push({ id: uuidv4(), ...alerta });
    },
    dismissed(alerta) {
      this.alertas = this.alertas.filter((x) => alerta.id !== x.id);
    },
  },
};
</script>

<style lang="scss" scoped>
#alert-box {
  position: fixed;
  bottom: 0;
  right: 260px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
button {
  margin-bottom: 0.2rem;
}
.alert {
  margin-bottom: 0.2rem;
  display: flex;
  width: auto;
}
</style>

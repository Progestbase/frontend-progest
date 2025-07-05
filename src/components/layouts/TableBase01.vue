<template>
  <span>
    <div class="row justify-content-center">
      <div :class="'col-md-' + (classColTable ? classColTable : '12')">
        <table class="table table-striped mb-0">
          <thead>
            <tr>
              <th v-for="(title, index) in titles" style="cursor: pointer; " :class="align[index]" :key="index">{{
                title
              }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isSearching">
              <td :colspan="titles.length" style="text-align: center;">
                <div class="spinner-border text-primary m-1" role="status">
                  <span class="sr-only">Carregando...</span>
                </div>
              </td>
            </tr>
            <tr v-else v-for="item in contentTable" :key="item.id">
              <td v-for="(i, col, index) in item" :class="align[index]" :key="col">

                <span v-if="indexLink == index">
                  <span v-if="item.fixo && item.fixo === 'S'">
                    <span>{{ item.nome }}</span>
                  </span>
                  <span v-else>
                    <LINKMODAL01 :idModalInsertUP="idModalUP" :label="i" :dataList="item" :titleModal="i"
                      :functions="functions" :idData="item.id"></LINKMODAL01>
                  </span>
                </span>

                <span v-else-if="col == 'color'"
                  :style="{ backgroundColor: i, display: 'block', width: '100%', height: '25px', color: 'white', padding: '2px' }">
                  {{ i }}
                </span>

                <span v-else-if="col === 'icon'"
                  :style="{ display: 'flex', justifyContent: 'center', alignItems: 'center' }">
                  <i :class="i" style="font-size: 20px; color: black;"></i>
                </span>

                <span v-else-if="col === 'only_ia'"
                  :style="{ display: 'flex', justifyContent: 'center', alignItems: 'center' }">
                  <i v-if="i == 'S'" class="mdi mdi-check-circle text-success"
                    style="font-size: 20px; color: black;"></i>
                  <i v-else class="mdi mdi-close-circle text-danger" style="font-size: 20px; color: black;"></i>
                </span>

                <span v-else-if="col === 'channel_type_id' && i === 1">WhatsApp</span>

                <span v-else-if="col === 'message'" style="text-align: left; display: block;">
                  {{ truncateText(i, 80) }}
                </span>

                <span v-else-if="col === 'content'" style="text-align: left; display: block;">
                  {{ truncateText(i, 80) }}
                </span>

                <span v-else-if="col === 'value'" style="text-align: left; display: block;" :title="i">
                  {{ truncateText(i, 20) }}
                </span>

                <span v-else-if="col === 'description'" style="text-align: left; display: block;" :title="i">
                  {{ truncateText(i, 20) }}
                </span>

                <span v-else-if="col === 'rota_default'" style="text-align: center; display: block;" :title="i">
                  <i
                    :class="['mdi', 'mdi-' + (i == 'S' ? 'check-circle ' : 'close-circle '), i == 'S' ? 'text-success' : 'text-danger', 'font-size-18']"></i>
                </span>

                <span v-else-if="col === 'type' && i === 'I'">
                  <span v-if="urlAtual === '/mensagens-predefinidas'">
                    <img :src="item.base64" alt="Imagem" style="max-height: 200px; max-width: 200px; height: auto;" />
                  </span>
                </span>

                <span v-else-if="col === 'type' && i === 'A'">
                  <span v-if="urlAtual === '/mensagens-predefinidas'">{{ getTypeLabelMsgPredefinidas(i) }}</span>
                  <span v-else-if="urlAtual === '/motivos-chat'">{{ getTypeLabelMotivosChat(i) }}</span>
                  <span v-else> {{ i }} </span>
                </span>

                <span v-else-if="col === 'type' && i === 'E'">
                  <span v-if="urlAtual === '/mensagens-predefinidas'">{{ getTypeLabelMsgPredefinidas(i) }}</span>
                  <span v-else-if="urlAtual === '/motivos-chat'">{{ getTypeLabelMotivosChat(i) }}</span>
                  <span v-else> {{ i }} </span>
                </span>

                <span v-else-if="col === 'type' && i === 'T'">
                  <span v-if="urlAtual === '/mensagens-predefinidas'">{{ getTypeLabelMsgPredefinidas(i) }}</span>
                  <span v-else-if="urlAtual === '/motivos-chat'">{{ getTypeLabelMotivosChat(i) }}</span>
                  <span v-else> {{ i }} </span>
                </span>

                <span v-else-if="col === 'type' && i === 'G'">
                  <span v-if="urlAtual === '/mensagens-predefinidas'">{{ getTypeLabelMsgPredefinidas(i) }}</span>
                  <span v-else> {{ i }} </span>
                </span>

                <span v-else-if="col === 'type' && i === 'V'">
                  <span v-if="urlAtual === '/mensagens-predefinidas'">{{ getTypeLabelMsgPredefinidas(i) }}</span>
                  <span v-else> {{ i }} </span>
                </span>

                <span v-else-if="col === 'type' && i === 'D'">
                  <span v-if="urlAtual === '/mensagens-predefinidas'">{{ getTypeLabelMsgPredefinidas(i) }}</span>
                  <span v-else> {{ i }} </span>
                </span>

                <span v-else-if="col === 'base64'"></span>


                <span v-else-if="col === 'type' && i === 'C'">
                  <span v-if="urlAtual === '/templates-meta'">{{ getTypeLabelTemplatesMeta(i) }}</span>
                  <span v-else> {{ i }} </span>
                </span>

                <span v-else-if="col === 'type' && i === 'P'">
                  <span v-if="urlAtual === '/templates-meta'">{{ getTypeLabelTemplatesMeta(i) }}</span>
                  <span v-else> {{ i }} </span>
                </span>

                <span v-else-if="col === 'type' && i === 'F'">
                  <span v-if="urlAtual === '/templates-meta'">{{ getTypeLabelTemplatesMeta(i) }}</span>
                  <span v-else> {{ i }} </span>
                </span>

                <span v-else>{{ i }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </span>
</template>

<script>
import LINKMODAL01 from '@/components/layouts/LinkModal01.vue';

export default {
  name: '',
  components: {
    LINKMODAL01
  },
  props: ['list', 'titles', 'align', 'indexLink', 'idModalUP', 'functions', 'classColTable'],
  data() {
    return {
      msg: ''
    }
  },
  mounted() {
    //console.log('mounted table')
  },
  computed: {
    contentTable() {
      console.log(this.list);
      if (this.list.data) {
        return this.list.data;
      } else {
        console.log('Ainda sem dado para tabular');
        return [];
      }
    },

    urlAtual() {
      return this.list.url;
    },

    isSearching() {
      console.log(this.$store.state.isSearching);
      return this.$store.state.isSearching;
    }
  },
  methods: {
    truncateText(text, maxLength) {
      return text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    getTypeLabelMsgPredefinidas(type) {
      const typeMap = {
        A: 'Áudio',
        I: 'Imagem',
        V: 'Vídeo',
        G: 'Geolocalização',
        T: 'Texto',
        D: 'Documento'
      };
      return typeMap[type] || type;
    },

    getTypeLabelMotivosChat(type) {
      const typeMap = {
        A: 'Agendar',
        E: 'Encerrar',
        T: 'Transferir'
      };
      return typeMap[type] || type;
    },

    getTypeLabelTemplatesMeta(type) {
      const typeMap = {
        P: "Personalizado",
        C: "Catálogo",
        F: "Flow"
      };
      return typeMap[type] || type;
    }
  }
}
</script>

<style scoped>
td {
  padding: 0.35rem 0.35rem;
}
</style>
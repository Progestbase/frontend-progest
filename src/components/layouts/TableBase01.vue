<template>
  <span>
    <div class="row justify-content-center">
      <div :class="'col-md-' + (classColTable ? classColTable : '12')">
        <table class="table table-striped mb-0">
          <thead>
            <tr>
              <th
                v-for="(title, index) in titles"
                style="cursor: pointer"
                :class="align[index]"
                :key="index"
              >
                {{ title }}
              </th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isSearching">
              <td :colspan="titles.length + 1" style="text-align: center">
                <div class="spinner-border text-primary m-1" role="status">
                  <span class="sr-only">Carregando...</span>
                </div>
              </td>
            </tr>
            <tr v-else v-for="item in contentTable" :key="item.id">
              <td
                v-for="(i, col, index) in item"
                :class="align[index]"
                :key="col"
              >
                <span v-if="indexLink == index">
                  <span v-if="item.fixo && item.fixo === 'S'">
                    <span>{{ item.nome }}</span>
                  </span>
                  <span v-else>
                    <LINKMODAL01
                      :idModalInsertUP="idModalUP"
                      :label="i"
                      :dataList="item"
                      :titleModal="i"
                      :functions="functions"
                      :idData="item.id"
                    ></LINKMODAL01>
                  </span>
                </span>

                <span
                  v-else-if="col == 'color'"
                  :style="{
                    backgroundColor: i,
                    display: 'block',
                    width: '100%',
                    height: '25px',
                    color: 'white',
                    padding: '2px',
                  }"
                >
                  {{ i }}
                </span>

                <span
                  v-else-if="col === 'icon'"
                  :style="{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }"
                >
                  <i :class="i" style="font-size: 20px; color: black"></i>
                </span>

                <span
                  v-else-if="col === 'only_ia'"
                  :style="{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }"
                >
                  <i
                    v-if="i == 'S'"
                    class="mdi mdi-check-circle text-success"
                    style="font-size: 20px; color: black"
                  ></i>
                  <i
                    v-else
                    class="mdi mdi-close-circle text-danger"
                    style="font-size: 20px; color: black"
                  ></i>
                </span>
                <span v-else>{{ i }}</span>
              </td>
              <td class="text-center">
                <button
                  class="btn btn-danger btn-sm"
                  @click="deleteItem(item.id)"
                  title="Excluir"
                  :disabled="item.fixo === 'S'"
                >
                  <i class="mdi mdi-delete"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </span>
</template>

<script>
import LINKMODAL01 from "@/components/layouts/LinkModal01.vue";

export default {
  name: "",
  components: {
    LINKMODAL01,
  },
  props: [
    "list",
    "titles",
    "align",
    "indexLink",
    "idModalUP",
    "functions",
    "classColTable",
    "deleteRoute",
  ],
  data() {
    return {
      msg: "",
    };
  },
  mounted() {
    //console.log('mounted table')
  },
  computed: {
    contentTable() {
      console.log("TableBase01 - list recebida:", this.list);
      console.log("TableBase01 - é array:", Array.isArray(this.list));
      console.log("TableBase01 - tipo:", typeof this.list);

      if (Array.isArray(this.list)) {
        console.log(
          "TableBase01 - retornando array direto, length:",
          this.list.length
        );
        return this.list;
      } else if (this.list && this.list.data) {
        console.log(
          "TableBase01 - retornando list.data, length:",
          this.list.data.length
        );
        return this.list.data;
      } else {
        console.log("TableBase01 - retornando array vazio");
        return [];
      }
    },

    urlAtual() {
      return this.list.url;
    },

    isSearching() {
      console.log(this.$store.state.isSearching);
      return this.$store.state.isSearching;
    },
  },
  methods: {
    truncateText(text, maxLength) {
      return text && text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
    },
    getTypeLabelMsgPredefinidas(type) {
      const typeMap = {
        A: "Áudio",
        I: "Imagem",
        V: "Vídeo",
        G: "Geolocalização",
        T: "Texto",
        D: "Documento",
      };
      return typeMap[type] || type;
    },

    getTypeLabelMotivosChat(type) {
      const typeMap = {
        A: "Agendar",
        E: "Encerrar",
        T: "Transferir",
      };
      return typeMap[type] || type;
    },

    getTypeLabelTemplatesMeta(type) {
      const typeMap = {
        P: "Personalizado",
        C: "Catálogo",
        F: "Flow",
      };
      return typeMap[type] || type;
    },

    deleteItem(id) {
      if (this.deleteRoute) {
        this.deleteItemGeneric(id, this.deleteRoute);
      } else {
        console.error("Nenhuma rota de delete ou funções fornecidas");
        alert("Funcionalidade de exclusão não disponível");
      }
    },

    deleteItemGeneric(id, route) {
      if (confirm("Tem certeza que deseja excluir este item?")) {
        this.$axios
          .post(`${route}/${id}`, {
            headers: {
              Authorization: "Bearer " + this.$store.getters.getUserToken,
            },
          })
          .then((response) => {
            if (response.data.status) {
              // Recarrega a lista se houver função de listagem
              if (this.functions && this.functions.listALL) {
                this.functions.listALL(this);
              } else if (this.functions && this.functions.listAll) {
                this.functions.listAll(this);
              }
              alert("Item excluído com sucesso");
              console.log("Item excluído:", response.data);
            } else {
              console.log("Erro ao excluir item:", response);
              alert("Erro ao excluir item");
            }
          })
          .catch((error) => {
            console.log(error);
            alert(
              "OPS! \nEstamos com algum problema, tente novamente mais tarde."
            );
          });
      }
    },
  },
};
</script>

<style scoped>
td {
  padding: 0.35rem 0.35rem;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
  transition: all 0.3s ease;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
  border-color: #bd2130;
  transform: scale(1.05);
}

.btn-danger:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.2rem;
}
</style>

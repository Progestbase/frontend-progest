<template>
  <span>
    <!-- Botão de criar novo (sem dataList = modo ADD) -->
    <template v-if="!dataList">
      <button
        type="button"
        @click="preencheForm('create')"
        class="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
      >
        <PlusIcon class="h-4 w-4" />
        {{ label }}
      </button>
    </template>

    <!-- Link para editar (com dataList = modo EDIT, exibido dentro da tabela) -->
    <template v-else>
      <a
        @click="preencheForm('edit', idData)"
        class="text-primary font-medium hover:underline cursor-pointer text-sm"
      >
        {{ label }}
      </a>
    </template>
  </span>
</template>

<script setup>
import { computed, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import { PlusIcon } from "lucide-vue-next";

const props = defineProps({
  idModalInsertUP: String, // Mantido apenas para compatibilidade de props, não mais usado como ID DOM
  dataList: [Array, Object],
  label: String,
  titleModal: String,
  functions: Object,
  idData: [String, Number],
  varsModalData: Object,
});

const store = useStore();
const { proxy } = getCurrentInstance();

const preencheForm = (tipo, idData = null) => {
  store.commit("setModalTitle", props.titleModal);
  if (tipo === "create") {
    store.commit("setModalData", props.varsModalData || {});
    store.commit("setModalFunction", "ADD");
    store.commit("setModalOpen", true);
  } else {
    if (props.functions && props.functions.listData) {
      props.functions.listData({
        $axios: proxy.$axios,
        $store: store,
        $toastr: proxy.$toastr,
        idData: idData,
        callback: () => {
          store.commit("setModalFunction", "UP");
          store.commit("setModalOpen", true);
        },
      });
    } else {
      // Fallback se não houver listData (caso simples)
      store.commit("setModalFunction", "UP");
      store.commit("setModalOpen", true);
    }
  }
};
</script>


<template>
  <div class="page-header mb-4">
    <div class="row align-items-center">
      <div class="col">
        <h4 class="mb-1">
          <i class="mdi" :class="icone"></i>
          {{ titulo }}
        </h4>
        <p class="text-muted mb-0" v-if="subtitulo">{{ subtitulo }}</p>
      </div>
      <div class="col-auto" v-if="showAddButton">
        <button class="btn btn-primary" @click="$emit('adicionar')">
          <i class="mdi mdi-plus me-2"></i>
          {{ addButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TopoCadastro01",
  props: {
    titulo: {
      type: String,
      required: true,
    },
    subtitulo: {
      type: String,
      default: "",
    },
    icone: {
      type: String,
      default: "mdi-folder",
    },
    showAddButton: {
      type: Boolean,
      default: true,
    },
    addButtonText: {
      type: String,
      default: "Adicionar",
    },
  },
  emits: ["adicionar"],
};
</script>

<style scoped>
.page-header {
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;
}

.page-header h4 {
  font-weight: 600;
  color: #313169;
  margin-bottom: 0.25rem;
}

.page-header h4 i {
  margin-right: 0.5rem;
  color: #313169;
}

.page-header .text-muted {
  font-size: 0.875rem;
}

.btn {
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn i {
  font-size: 16px;
}
</style>

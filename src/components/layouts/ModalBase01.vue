<template>
  <div class="modal fade" :id="idModal" tabindex="-1" :aria-labelledby="idModal + 'Label'" aria-hidden="true">
    <div class="modal-dialog" :class="modalSizeClass" :style="{ width: !modalSizeClass ? width : null }">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" :id="idModal + 'Label'">{{ title }}</h5>
          <button type="button" class="btn-close" @click="handleInternalClose" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div v-if="showFooter" class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalBase01',
  props: {
    idModal: {
      type: String,
      required: true
    },
    title: String,
    // A prop 'isOpen' não controlará mais o v-if.
    // Pode ser usada se o pai quiser abrir/fechar o modal programaticamente usando a API JS do Bootstrap.
    // isOpen: Boolean,
    width: String, // Usado se modalSizeClass não for fornecido
    showFooter: {
      type: Boolean,
      default: true
    },
    modalSizeClass: String // Ex: 'modal-lg', 'modal-sm', 'modal-xl' para controlar o tamanho
  },
  emits: ['closed'], 
  methods: {
    handleInternalClose() {
      // Este método é chamado pelo botão de fechar interno do ModalBase.
      // Ele deve sinalizar ao componente pai ou diretamente fechar via API JS se este componente gerenciar a instância.
      this.$emit('closed'); // O pai pode usar isso para atualizar seu estado, se necessário.

      // Para fechar usando a API do Bootstrap diretamente daqui (se este componente fosse autônomo):
      // const modalEl = document.getElementById(this.idModal);
      // if (modalEl) {
      //   const modalInstance = bootstrap.Modal.getInstance(modalEl);
      //   if (modalInstance) {
      //     modalInstance.hide();
      //   }
      // }
    }
  },
  mounted() {
    // Opcional: Escutar eventos do Bootstrap e reemiti-los ou sincronizar estado
    const modalEl = document.getElementById(this.idModal);
    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        // Este evento é disparado pelo Bootstrap quando o modal termina de ser escondido.
        this.$emit('closed');
      });
      // modalEl.addEventListener('shown.bs.modal', () => {
      //   this.$emit('opened');
      // });
    }
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title { /* Mantendo seu estilo se desejado */
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
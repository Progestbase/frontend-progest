<template>
  <div class="modal modal-lg fade" :id="idModal" tabindex="-1" :aria-labelledby="idModal + 'Label'" aria-hidden="true">
    <div class="modal-dialog" :class="modalSizeClass" :style="{ width: !modalSizeClass ? width : null }">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="btn-close" data-bs-dismiss="modal" @click="handleInternalClose" aria-label="Close"></button>
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
    width: String,
    showFooter: {
      type: Boolean,
      default: true
    },
    modalSizeClass: String
  },
  emits: ['closed'],
  methods: {
    handleInternalClose() {
      const modalEl = document.getElementById(this.idModal);
      console.log('modalEl:', modalEl, 'bootstrap:', window.bootstrap);
      if (modalEl) {
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
        modalInstance.hide();
      }
      this.$emit('closed');
    }
  },
  mounted() {
    const modalEl = document.getElementById(this.idModal);
    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.$emit('closed');
      });
      // moda
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

.modal-title {
  /* Mantendo seu estilo se desejado */
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
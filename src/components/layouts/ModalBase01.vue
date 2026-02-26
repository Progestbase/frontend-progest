<script setup>
/**
 * ModalBase01 - Refatorado para Shadcn Dialog
 * Mantendo a prop idModal apenas para compatibilidade de API,
 * mas o controle agora é reativo via Vuex (isModalOpen).
 */
import { computed } from "vue";
import { useStore } from "vuex";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-vue-next";

const props = defineProps({
  idModal: { type: String, required: true },
  title: String,
  showFooter: { type: Boolean, default: true },
});

const store = useStore();

const isModalOpen = computed({
  get: () => store.state.modalData.isModalOpen,
  set: (value) => store.commit("setModalOpen", value),
});

const modalTitle = computed(
  () => store.state.modalData.modalTitle || props.title,
);

const handleClose = () => {
  store.commit("setModalOpen", false);
};
</script>

<template>
  <Dialog :open="isModalOpen" @update:open="handleClose">
    <DialogContent
      class="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0"
    >
      <DialogHeader class="p-6 pb-2 border-b">
        <DialogTitle class="text-lg font-semibold text-slate-800">
          {{ modalTitle }}
        </DialogTitle>
      </DialogHeader>

      <div class="p-6 overflow-y-auto">
        <slot />
      </div>

      <div
        v-if="showFooter"
        class="p-4 border-t flex justify-end gap-2 bg-slate-50"
      >
        <slot name="footer" />
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Removendo estilos Bootstrap legados que podem conflitar */
:deep(.modal-body) {
  padding: 0;
}
</style>

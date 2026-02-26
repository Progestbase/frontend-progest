<script setup lang="ts">
/**
 * CadastroDialog — Wrapper Shadcn Dialog para substituir o ModalBase01 Bootstrap
 * nos formulários de cadastro. Controlado via v-model:open do componente pai.
 *
 * Props:
 *   title     — Título do dialog
 *   open      — v-model para controlar abertura
 * Emits:
 *   update:open — para fechar o dialog
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

defineProps<{
  title?: string;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const close = () => emit("update:open", false);
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader v-if="title">
        <DialogTitle class="text-base font-semibold text-slate-800">
          {{ title }}
        </DialogTitle>
      </DialogHeader>

      <!-- Conteúdo do formulário (injetado pelo componente pai) -->
      <div class="space-y-4">
        <slot />
      </div>

      <!-- Footer com botões (injetado pelo componente pai) -->
      <div class="flex justify-end gap-2 pt-2 border-t mt-4">
        <slot name="footer" :close="close" />
      </div>
    </DialogContent>
  </Dialog>
</template>

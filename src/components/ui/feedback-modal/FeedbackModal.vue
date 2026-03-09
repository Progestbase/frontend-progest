<script setup>
/**
 * FeedbackModal — Modal global personalizado para mensagens de feedback
 * Substitui os alert() nativos do navegador por um modal estilizado.
 *
 * Tipos suportados:
 *   - success  → ícone verde de check, título "Sucesso"
 *   - error    → ícone vermelho de X, título "Erro"
 *   - warning  → ícone amarelo de alerta, título "Atenção"
 *   - info     → ícone azul de info, título "Informação"
 *   - validation → ícone vermelho + lista de erros de validação
 *
 * Uso global via $feedback.success("mensagem"), $feedback.error("mensagem"), etc.
 */
import { computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2Icon,
  XCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
} from "lucide-vue-next";
import { useFeedbackModal } from "./use-feedback-modal";

const { state, close } = useFeedbackModal();

const isOpen = computed({
  get: () => state.value.isOpen,
  set: (val) => {
    if (!val) close();
  },
});

const iconComponent = computed(() => {
  const map = {
    success: CheckCircle2Icon,
    error: XCircleIcon,
    warning: AlertTriangleIcon,
    info: InfoIcon,
    validation: XCircleIcon,
  };
  return map[state.value.type] || InfoIcon;
});

const iconClass = computed(() => {
  const map = {
    success: "text-emerald-500",
    error: "text-red-500",
    warning: "text-amber-500",
    info: "text-blue-500",
    validation: "text-red-500",
  };
  return map[state.value.type] || "text-blue-500";
});

const bgClass = computed(() => {
  const map = {
    success: "bg-emerald-50 border-emerald-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-blue-50 border-blue-200",
    validation: "bg-red-50 border-red-200",
  };
  return map[state.value.type] || "bg-blue-50 border-blue-200";
});

const titleText = computed(() => {
  if (state.value.title) return state.value.title;
  const map = {
    success: "Sucesso",
    error: "Erro",
    warning: "Atenção",
    info: "Informação",
    validation: "Erros de Validação",
  };
  return map[state.value.type] || "Informação";
});

const titleClass = computed(() => {
  const map = {
    success: "text-emerald-800",
    error: "text-red-800",
    warning: "text-amber-800",
    info: "text-blue-800",
    validation: "text-red-800",
  };
  return map[state.value.type] || "text-blue-800";
});

const btnClass = computed(() => {
  const map = {
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white border-0 focus:ring-emerald-500",
    error:
      "bg-red-600 hover:bg-red-700 text-white border-0 focus:ring-red-500",
    warning:
      "bg-amber-600 hover:bg-amber-700 text-white border-0 focus:ring-amber-500",
    info: "bg-blue-600 hover:bg-blue-700 text-white border-0 focus:ring-blue-500",
    validation:
      "bg-red-600 hover:bg-red-700 text-white border-0 focus:ring-red-500",
  };
  return map[state.value.type] || "";
});
</script>

<template>
  <Dialog :open="isOpen" @update:open="(v) => (isOpen = v)">
    <DialogContent
      class="sm:max-w-md"
      :class="{ 'sm:max-w-lg': state.type === 'validation' }"
    >
      <DialogHeader class="space-y-3">
        <div class="flex items-center gap-3">
          <div
            class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border"
            :class="bgClass"
          >
            <component :is="iconComponent" class="w-5 h-5" :class="iconClass" />
          </div>
          <DialogTitle class="text-lg font-semibold" :class="titleClass">
            {{ titleText }}
          </DialogTitle>
        </div>
        <DialogDescription class="sr-only">
          {{ titleText }}
        </DialogDescription>
      </DialogHeader>

      <!-- Mensagem simples -->
      <div
        v-if="state.message && state.type !== 'validation'"
        class="py-2 text-sm text-slate-700 leading-relaxed"
      >
        {{ state.message }}
      </div>

      <!-- Lista de erros de validação -->
      <div v-if="state.type === 'validation' && state.validationErrors" class="py-2">
        <p
          v-if="state.message"
          class="text-sm text-slate-600 mb-3"
        >
          {{ state.message }}
        </p>
        <div class="rounded-lg border border-red-100 bg-red-50/50 p-3 space-y-1.5 max-h-60 overflow-y-auto">
          <div
            v-for="(mensagens, campo) in state.validationErrors"
            :key="campo"
            class="flex items-start gap-2 text-sm"
          >
            <span class="text-red-400 mt-0.5 flex-shrink-0">•</span>
            <span class="text-red-700">{{ mensagens[0] }}</span>
          </div>
        </div>
      </div>

      <DialogFooter class="pt-2">
        <Button
          @click="close"
          class="min-w-[90px] transition-all"
          :class="btnClass"
        >
          OK
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TagIcon,
  ShapesIcon,
  ShieldCheckIcon,
  HashIcon,
} from "lucide-vue-next";

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:open"]);

const close = () => emit("update:open", false);
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="text-base font-semibold text-slate-800">
          Detalhes do Grupo de Produto
        </DialogTitle>
      </DialogHeader>

      <div class="space-y-5 py-2">
        <!-- Header -->
        <div class="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div
            class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary shadow-sm border border-primary/10"
          >
            <TagIcon class="w-7 h-7" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-bold text-slate-800 tracking-tight leading-tight">
              {{ item.nome || "—" }}
            </h3>
            <div class="flex items-center gap-2 mt-1">
              <Badge
                :variant="item.status === 'A' || item.status === 'Ativo' ? 'default' : 'destructive'"
                class="text-[10px] px-2.5 py-0.5 uppercase tracking-widest font-bold rounded-full"
              >
                {{ item.status === "A" ? "Ativo" : item.status === "I" ? "Inativo" : item.status || "—" }}
              </Badge>
              <span class="text-[10px] text-slate-400 font-mono">
                ID #{{ item.id || "—" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Informações -->
        <div class="grid grid-cols-1 gap-3.5">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <TagIcon class="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Nome</p>
              <p class="text-sm text-slate-700 font-medium">{{ item.nome || "—" }}</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <ShapesIcon class="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Tipo / Classificação</p>
              <p class="text-sm text-slate-700 font-medium">{{ item.tipo || "—" }}</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <ShieldCheckIcon class="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Status</p>
              <Badge
                :variant="item.status === 'A' || item.status === 'Ativo' ? 'default' : 'destructive'"
                class="text-[10px] px-2.5 py-0.5 uppercase tracking-widest font-bold rounded-full mt-0.5"
              >
                {{ item.status === "A" ? "Ativo" : item.status === "I" ? "Inativo" : item.status || "—" }}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-2 border-t mt-2">
        <Button variant="outline" @click="close">Fechar</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

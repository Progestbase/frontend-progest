<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserCircleIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  FingerprintIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
} from "lucide-vue-next";

const props = defineProps({
  open: { type: Boolean, default: false },
  user: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:open"]);
const store = useStore();

const listTiposVinculo = computed(() => store.state.listTiposVinculo || []);

const tipoVinculoNome = computed(() => {
  if (!props.user?.tipo_vinculo) return "N/A";
  const tipo = listTiposVinculo.value.find(
    (t) => t.id == props.user.tipo_vinculo,
  );
  return tipo ? tipo.nome : props.user.tipo_vinculo;
});

const formatCpf = (cpf) => {
  if (!cpf) return "---";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return cpf;
};

const formatTelefone = (tel) => {
  if (!tel) return "—";
  const digits = tel.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return tel;
};

const formatDate = (date) => {
  if (!date) return "—";
  try {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

const close = () => emit("update:open", false);
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle class="text-base font-semibold text-slate-800">
          Detalhes do Usuário
        </DialogTitle>
      </DialogHeader>

      <div class="space-y-5 py-2">
        <!-- Header com avatar e nome -->
        <div class="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div
            class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary shadow-sm border border-primary/10"
          >
            <UserCircleIcon class="w-8 h-8" />
          </div>
          <div class="flex-1 min-w-0">
            <h3
              class="text-lg font-bold text-slate-800 tracking-tight capitalize leading-tight"
            >
              {{ (user.name || "—").toLowerCase() }}
            </h3>
            <div class="flex items-center gap-2 mt-1">
              <Badge
                :variant="user.status === 'A' ? 'default' : 'destructive'"
                class="text-[10px] px-2.5 py-0.5 uppercase tracking-widest font-bold rounded-full"
              >
                {{ user.status === "A" ? "Ativo" : "Inativo" }}
              </Badge>
              <span
                class="text-[10px] text-slate-400 font-mono"
              >
                ID #{{ user.id || "—" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Informações -->
        <div class="grid grid-cols-1 gap-3.5">
          <!-- E-mail -->
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"
            >
              <MailIcon class="w-4 h-4 text-blue-500" />
            </div>
            <div class="min-w-0">
              <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                E-mail
              </p>
              <p class="text-sm text-slate-700 font-medium truncate">
                {{ user.email || "—" }}
              </p>
            </div>
          </div>

          <!-- CPF -->
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0"
            >
              <FingerprintIcon class="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                CPF
              </p>
              <p class="text-sm text-slate-700 font-mono font-medium">
                {{ formatCpf(user.cpf) }}
              </p>
            </div>
          </div>

          <!-- Telefone -->
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0"
            >
              <PhoneIcon class="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Telefone
              </p>
              <p class="text-sm text-slate-700 font-medium">
                {{ formatTelefone(user.telefone) }}
              </p>
            </div>
          </div>

          <!-- Data de Nascimento -->
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"
            >
              <CalendarIcon class="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Data de Nascimento
              </p>
              <p class="text-sm text-slate-700 font-medium">
                {{ formatDate(user.data_nascimento) }}
              </p>
            </div>
          </div>

          <!-- Tipo de Vínculo -->
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0"
            >
              <BriefcaseIcon class="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Tipo de Vínculo
              </p>
              <p class="text-sm text-slate-700 font-medium">
                {{ tipoVinculoNome }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end pt-2 border-t mt-2">
        <Button variant="outline" @click="close">Fechar</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

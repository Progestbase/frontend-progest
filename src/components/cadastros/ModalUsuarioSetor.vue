<script setup>
import { ref, watch, computed, inject } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  UserPlusIcon,
  ShieldCheckIcon,
  UserCogIcon,
  CheckIcon,
  AlertCircleIcon,
} from "lucide-vue-next";
import Funcoes from "@/functions/cad_usuario_setor.js";

const props = defineProps({
  setorId: { type: [Number, String], required: true },
  mode: { type: String, default: "ADD" },
  initialData: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["changed"]);

const isOpen = ref(false);
const loading = ref(false);
const availableUsers = ref([]);
const form = ref({
  usuario_id: "",
  perfil: "solicitante",
});

const parentContext = inject("setorAtualContext", {
  $axios: null,
  $store: null,
  $toastr: undefined,
});

const openModal = () => {
  isOpen.value = true;
};

const closeModal = () => {
  isOpen.value = false;
};

defineExpose({ openModal, closeModal });

const loadData = async () => {
  const context = {
    $axios: parentContext.$axios,
    $store: parentContext.$store,
    $toastr: parentContext.$toastr,
  };

  try {
    const linked = await Funcoes.listBySetor(context, props.setorId);
    const all = await Funcoes.listAllUsers(context);

    const linkedIds = new Set((linked || []).map((u) => u.id));
    availableUsers.value = (all || []).filter((u) => !linkedIds.has(u.id));
  } catch (err) {
    console.error("Erro ao carregar dados do modal:", err);
  }
};

watch(isOpen, (newVal) => {
  if (newVal) {
    loadData();
    if (props.mode === "UP" && props.initialData) {
      form.value.usuario_id = props.initialData.usuario_id;
      form.value.perfil = props.initialData.perfil || "solicitante";
    }
  } else {
    form.value = { usuario_id: "", perfil: "solicitante" };
  }
});

const submit = async () => {
  const context = {
    $axios: parentContext.$axios,
    $store: parentContext.$store,
    $toastr: parentContext.$toastr,
  };

  loading.value = true;
  try {
    const payload = {
      usuario_id: form.value.usuario_id || props.initialData.usuario_id,
      setor_id: props.setorId,
      perfil: form.value.perfil,
    };

    let resp;
    if (props.mode === "ADD") {
      if (!form.value.usuario_id) {
        if (context.$toastr) context.$toastr.error("Selecione um usuário.");
        loading.value = false;
        return;
      }
      resp = await Funcoes.create(context, payload);
    } else {
      resp = await Funcoes.update(context, payload);
    }

    if (resp && resp.status) {
      if (context.$toastr)
        context.$toastr.success(
          props.mode === "ADD" ? "Usuário vinculado!" : "Perfil atualizado!",
        );
      closeModal();
      emit("changed");
    } else {
      if (context.$toastr)
        context.$toastr.error(resp?.message || "Erro na operação.");
    }
  } catch (err) {
    console.error(err);
    if (context.$toastr)
      context.$toastr.error("Falha ao processar solicitação.");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent
      class="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem]"
    >
      <DialogHeader class="p-8 bg-slate-50 border-b border-slate-100 relative">
        <div class="absolute top-0 right-0 p-8 opacity-[0.03]">
          <UserCogIcon class="w-24 h-24" />
        </div>

        <div class="flex items-center gap-4 relative z-10">
          <div class="p-3 bg-primary/10 rounded-2xl text-primary">
            <UserPlusIcon v-if="mode === 'ADD'" class="w-6 h-6" />
            <ShieldCheckIcon v-else class="w-6 h-6" />
          </div>
          <div>
            <DialogTitle
              class="text-xl font-black text-slate-900 tracking-tight"
            >
              {{ mode === "ADD" ? "Vincular Usuário" : "Ajustar Permissões" }}
            </DialogTitle>
            <DialogDescription class="text-slate-500 font-medium">
              {{
                mode === "ADD"
                  ? "Selecione um colaborador para este setor."
                  : "Modifique o nível de acesso do usuário."
              }}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div class="p-8 space-y-6">
        <!-- User Selection (ADD ONLY) -->
        <div v-if="mode === 'ADD'" class="space-y-3">
          <Label
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1"
            >Colaborador Disponível</Label
          >
          <Select v-model="form.usuario_id">
            <SelectTrigger
              class="h-12 border-slate-200 rounded-xl bg-slate-50/30"
            >
              <SelectValue placeholder="Busque um usuário..." />
            </SelectTrigger>
            <SelectContent class="rounded-xl border-slate-200">
              <SelectItem
                v-for="u in availableUsers"
                :key="u.id"
                :value="u.id.toString()"
                class="py-3 px-4"
              >
                <div class="flex flex-col">
                  <span class="font-bold text-slate-800">{{ u.name }}</span>
                  <span class="text-[10px] text-slate-400 font-medium">{{
                    u.email
                  }}</span>
                </div>
              </SelectItem>
              <div
                v-if="availableUsers.length === 0"
                class="flex flex-col items-center py-6 px-4 text-center"
              >
                <AlertCircleIcon class="w-6 h-6 text-slate-300 mb-2" />
                <span class="text-xs text-slate-400 font-medium"
                  >Todos os usuários já estão vinculados.</span
                >
              </div>
            </SelectContent>
          </Select>
        </div>

        <!-- Role Selection -->
        <div class="space-y-3">
          <Label
            class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1"
            >Nível de Acesso (Perfil)</Label
          >
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="role in ['admin', 'almoxarife', 'solicitante']"
              :key="role"
              @click="form.perfil = role"
              :class="[
                'flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 text-start',
                form.perfil === role
                  ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                  : 'border-slate-100 hover:border-slate-200 bg-white',
              ]"
            >
              <div class="flex flex-col">
                <span
                  class="text-xs font-black uppercase tracking-widest text-slate-900"
                  >{{ role }}</span
                >
                <span class="text-[10px] text-slate-500 font-medium mt-0.5">
                  {{
                    role === "admin"
                      ? "Controle total do setor"
                      : role === "almoxarife"
                        ? "Gestão de estoque e entradas"
                        : "Apenas requisições de itens"
                  }}
                </span>
              </div>
              <div
                v-if="form.perfil === role"
                class="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white"
              >
                <CheckIcon class="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <DialogFooter
        class="px-8 pb-8 pt-2 flex flex-col-reverse sm:flex-row gap-3"
      >
        <Button
          variant="ghost"
          @click="closeModal"
          class="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:text-slate-600"
        >
          Descartar
        </Button>
        <Button
          @click="submit"
          :disabled="loading"
          class="flex-1 h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          {{ mode === "ADD" ? "Vincular Agora" : "Salvar Alterações" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

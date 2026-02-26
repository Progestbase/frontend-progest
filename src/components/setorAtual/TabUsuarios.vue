<script setup>
import { computed, inject, ref } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  UsersIcon,
  UserPlusIcon,
  Trash2Icon,
  ShieldCheckIcon,
  MailIcon,
  UserCircleIcon,
} from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast/use-toast";

const props = defineProps({
  setorId: { type: Number, required: true },
});

const store = useStore();
const { toast } = useToast();

const parentData = inject("setorAtualData", {
  usuariosItems: [],
});

const filterSearch = ref("");

const listUsuarios = computed(() => {
  const items =
    parentData.usuariosItems?.value || parentData.usuariosItems || [];
  if (!filterSearch.value.trim()) return items;
  const term = filterSearch.value.toLowerCase();
  return items.filter((u) => {
    const name = (u.name || u.usuario?.name || "").toLowerCase();
    const email = (u.email || u.usuario?.email || "").toLowerCase();
    return name.includes(term) || email.includes(term);
  });
});

const getPerfilBadge = (perfil) => {
  const p = (perfil || "").toLowerCase();
  if (p.includes("admin"))
    return { label: "Administrador", variant: "destructive" };
  if (p.includes("gerente")) return { label: "Gerente", variant: "default" };
  return { label: "Solicitante", variant: "secondary" };
};

const handleDesvincular = async (usuarioId) => {
  if (!confirm("Tem certeza que deseja remover este usuário desta unidade?"))
    return;

  try {
    await axios.delete(`/usuarios-setor/${usuarioId}`, {
      headers: { Authorization: "Bearer " + store.getters.getUserToken },
    });
    toast({ title: "Sucesso", description: "Usuário removido da unidade." });
    location.reload();
  } catch (e) {
    toast({
      title: "Erro",
      description: "Falha ao desvincular usuário.",
      variant: "destructive",
    });
  }
};
</script>

<template>
  <div class="flex flex-col gap-8 pb-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-end gap-6">
      <div class="flex items-center gap-3">
        <div class="relative hidden sm:block">
          <Input
            v-model="filterSearch"
            placeholder="Buscar usuário..."
            class="px-4 h-10 w-64 bg-white"
          />
        </div>
        <Button class="gap-2 shadow-lg shadow-primary/20">
          <UserPlusIcon class="w-4 h-4" /> Vincular Usuário
        </Button>
      </div>
    </div>

    <!-- User Grid -->
    <div
      v-if="listUsuarios.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      <Card
        v-for="user in listUsuarios"
        :key="user.id"
        class="border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
      >
        <CardContent class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors"
              >
                <UserCircleIcon class="w-7 h-7" />
              </div>
              <div class="flex flex-col">
                <span class="font-black text-slate-800 leading-tight">{{
                  user.name || user.usuario?.name || "Usuário"
                }}</span>
                <span
                  class="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium"
                >
                  <MailIcon class="w-3 h-3" />
                  {{ user.email || user.usuario?.email || "-" }}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              @click="handleDesvincular(user.id)"
              class="h-8 w-8 text-slate-300 hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2Icon class="w-4 h-4" />
            </Button>
          </div>

          <div
            class="flex items-center justify-between pt-4 border-t border-slate-50"
          >
            <div class="flex items-center gap-2">
              <ShieldCheckIcon class="w-3.5 h-3.5 text-slate-400" />
              <Badge
                :variant="
                  getPerfilBadge(user.perfil || user.pivot?.perfil).variant
                "
                class="text-[10px] font-black uppercase px-2 py-0"
              >
                {{ getPerfilBadge(user.perfil || user.pivot?.perfil).label }}
              </Badge>
            </div>
            <span
              class="text-[10px] font-bold text-slate-300 uppercase tracking-widest"
              >Acesso Ativo</span
            >
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl"
    >
      <div class="p-6 bg-white rounded-full shadow-sm mb-4">
        <UsersIcon class="w-12 h-12 text-slate-300" />
      </div>
      <h3 class="text-slate-800 font-bold text-lg">Sem Usuários Vinculados</h3>
      <p class="text-slate-500 text-sm max-w-xs text-center mt-2">
        Nenhum colaborador foi designado para esta unidade. Use o botão acima
        para começar.
      </p>
    </div>
  </div>
</template>

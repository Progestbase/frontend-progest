<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h5 class="mb-1">
          <i class="mdi mdi-account-multiple me-2"></i>
          Usuários do Setor
        </h5>
        <p class="text-muted mb-0">
          Lista de usuários vinculados a este setor.
        </p>
      </div>
      <div>
        <Button
          @click.prevent="abrirModalAdicionarUsuario"
          :disabled="!setorId"
          size="default"
        >
          <i class="mdi mdi-plus me-2"></i>Adicionar usuário
        </Button>
      </div>
    </div>

    <div v-if="listUsuariosSetor.length > 0" class="table-responsive">
      <table class="table table-striped align-middle mb-0">
        <thead>
          <tr>
            <th class="text-start">#</th>
            <th class="text-start">Nome</th>
            <th class="text-start">E-mail</th>
            <th class="text-center">Perfil</th>
            <th class="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in listUsuariosSetor" :key="u.id">
            <td class="text-start">{{ u.id }}</td>
            <td class="text-start">{{ u.name }}</td>
            <td class="text-start">{{ u.email }}</td>
            <td class="text-center">
              {{ u.perfil || (u.pivot && u.pivot.perfil) || "-" }}
            </td>
            <td class="text-center">
              <div class="d-flex gap-2 justify-content-center">
                <Button
                  variant="edit"
                  size="icon-sm"
                  @click.prevent="abrirModalEditarUsuario(u)"
                  title="Editar"
                >
                  <i class="mdi mdi-pencil"></i>
                </Button>
                <Button
                  variant="delete"
                  size="icon-sm"
                  @click.prevent="abrirAlertRemocao(u)"
                  title="Remover"
                >
                  <i class="mdi mdi-trash-can"></i>
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center py-5">
      <div class="d-flex flex-column align-items-center">
        <i class="mdi mdi-account-multiple display-4 text-muted mb-3"></i>
        <h5>Nenhum usuário vinculado</h5>
        <p class="text-muted mb-0">
          Clique em "Adicionar usuário" para criar o vínculo.
        </p>
      </div>
    </div>

    <!-- Modal gerenciar vínculo usuário-setor -->
    <ModalUsuarioSetor
      ref="modalUsuarioSetor"
      idModal="modalUsuarioSetor"
      :setorId="setorId"
      :mode="modalMode"
      :initialData="modalInitialData"
      @changed="recarregarUsuarios"
    />

    <!-- Alert Dialog para confirmar remoção -->
    <AlertDialog :open="showAlertRemocao">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover o vínculo de
            <strong>{{ usuarioParaRemover?.name }}</strong> com este setor? Esta
            ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showAlertRemocao = false" as-child>
            <Button variant="outline"> Cancelar </Button>
          </AlertDialogCancel>
          <AlertDialogAction @click="executarRemocao" as-child>
            <Button variant="delete">
              <i class="mdi mdi-trash-can me-2"></i>Remover
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup>
import { defineProps, ref, computed, inject } from "vue";
import ModalUsuarioSetor from "@/components/cadastros/ModalUsuarioSetor.vue";
import usuarioSetorFunctions from "@/functions/cad_usuario_setor.js";
import { useToast } from "@/composables/useToast";
import { Button } from "@/components/ui/button";
import * as bootstrap from "bootstrap";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const { success, error } = useToast();

const props = defineProps({
  setorId: {
    type: Number,
    required: true,
  },
});

// Receber dados do componente pai (SetorAtualView) via provide/inject
const parentData = inject("setorAtualData", {
  usuariosItems: [],
});

// Receber contexto do pai para operações (axios, store, etc)
const parentContext = inject("setorAtualContext", {
  $axios: null,
  $store: null,
  $toastr: undefined,
});

const modalMode = ref("ADD");
const modalInitialData = ref({});
const modalUsuarioSetor = ref(null);

// Estados para AlertDialog
const showAlertRemocao = ref(false);
const usuarioParaRemover = ref(null);

const listUsuariosSetor = computed(() => {
  const items = parentData.usuariosItems;
  // Se for uma ref (Composition API), usar .value
  return items?.value || items || [];
});

const recarregarUsuarios = async () => {
  if (!props.setorId) return;
  loadUsuariosSetor();
};

const loadUsuariosSetor = async () => {
  if (!props.setorId) return;
  try {
    // Usar contexto do parent (sem .value)
    const context = {
      $axios: parentContext.$axios,
      $store: parentContext.$store,
      $toastr: parentContext.$toastr,
    };

    const data = await usuarioSetorFunctions.listBySetor(
      context,
      props.setorId
    );

    // Mapear dados para garantir estrutura consistente
    const usuariosMapeados = (data || []).map((u) => ({
      id: u.id,
      name: u.name || u.nome || "",
      email: u.email || "",
      perfil: u.perfil || (u.pivot && u.pivot.perfil) || "",
      pivot: u.pivot || {},
    }));

    // Atualizar a ref do parent
    if (parentData.usuariosItems?.value !== undefined) {
      parentData.usuariosItems.value = usuariosMapeados;
    } else if (parentData.usuariosItems !== undefined) {
      Object.assign(parentData, { usuariosItems: usuariosMapeados });
    }
  } catch (err) {
    console.error("Erro ao carregar usuários:", err);
  }
};

const abrirModalAdicionarUsuario = () => {
  modalMode.value = "ADD";
  modalInitialData.value = {};
  // Usar novo sistema de Dialog (ref)
  if (modalUsuarioSetor.value) {
    modalUsuarioSetor.value.openModal();
  }
};

const abrirModalEditarUsuario = (u) => {
  modalMode.value = "UP";
  modalInitialData.value = { usuario_id: u.id, perfil: u.perfil };
  // Usar novo sistema de Dialog (ref)
  if (modalUsuarioSetor.value) {
    modalUsuarioSetor.value.openModal();
  }
};

const abrirAlertRemocao = (u) => {
  usuarioParaRemover.value = u;
  showAlertRemocao.value = true;
};

const executarRemocao = () => {
  showAlertRemocao.value = false;
  if (!usuarioParaRemover.value) return;

  const context = {
    $axios: parentContext.$axios,
    $store: parentContext.$store,
    $toastr: parentContext.$toastr,
  };

  usuarioSetorFunctions
    .remove(context, {
      usuario_id: usuarioParaRemover.value.id,
      setor_id: props.setorId,
    })
    .then((resp) => {
      if (resp && resp.status) {
        success("Sucesso!", "Vínculo removido com sucesso");
        recarregarUsuarios();
      } else {
        const msg = resp?.message || "Erro ao remover vínculo";
        error("Erro!", msg);
      }
    })
    .catch((err) => {
      const status = err?.response?.status;
      const errMsg =
        status === 403 ? "Permissão negada" : "Erro ao remover vínculo";
      error("Erro!", errMsg);
    });
};
</script>

<style scoped>
.table-responsive {
  border-radius: 0.25rem;
  border: 1px solid #e9ecef;
}

.table {
  margin-bottom: 0;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>

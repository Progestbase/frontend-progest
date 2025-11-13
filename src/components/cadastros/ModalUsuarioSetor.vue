<template>
  <Dialog :open="isOpen" @update:open="isOpen = $event">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader class="text-start">
        <DialogTitle class="flex gap-2">
          <i class="mdi mdi-account-group text-primary"></i>
          {{
            mode === "ADD"
              ? "Adicionar Usuário ao Setor"
              : "Editar Perfil do Usuário"
          }}
        </DialogTitle>
        <DialogDescription>
          {{
            mode === "ADD"
              ? "Adicione novo usuario ao setor."
              : "Mude o perfil do usuário no setor."
          }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Campo Usuário (apenas para ADD) -->
        <div v-if="mode === 'ADD'" class="space-y-2">
          <Label for="usuario">Usuário *</Label>
          <Select v-model="form.usuario_id">
            <SelectTrigger id="usuario">
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="u in availableUsers" :key="u.id" :value="u.id">
                {{ u.name }} - {{ u.email }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Campo Perfil -->
        <div class="space-y-2">
          <Label for="perfil">Perfil *</Label>
          <Select v-model="form.perfil">
            <SelectTrigger id="perfil">
              <SelectValue placeholder="Selecione um perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="almoxarife">Almoxarife</SelectItem>
              <SelectItem value="solicitante">Solicitante</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter class="mt-6">
        <Button variant="outline" @click="isOpen = false"> Cancelar </Button>
        <Button variant="default" @click="submit">
          <i class="mdi mdi-check-bold me-2"></i>
          {{ mode === "ADD" ? "Adicionar" : "Atualizar" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script>
import Funcoes from "@/functions/cad_usuario_setor.js";
import { useToast } from "@/composables/useToast";
import { ref, inject } from "vue";
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

const { success, error } = useToast();

export default {
  name: "ModalUsuarioSetor",
  components: {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Label,
    Button,
  },
  props: {
    idModal: { type: String, required: true },
    setorId: { type: [Number, String], required: true },
    mode: { type: String, default: "ADD" },
    initialData: { type: Object, default: () => ({}) },
    functions: { type: Object, default: () => Funcoes },
  },
  setup() {
    // Receber contexto do parent via inject
    const parentContext = inject("setorAtualContext", {
      $axios: null,
      $store: null,
      $toastr: undefined,
    });

    return {
      isOpen: ref(false),
      parentContext,
    };
  },
  data() {
    return {
      availableUsers: [],
      linkedUsers: [],
      form: {
        usuario_id: "",
        perfil: "solicitante",
      },
    };
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.loadData();
        if (this.mode === "UP" && this.initialData) {
          this.form.usuario_id = this.initialData.usuario_id;
          this.form.perfil = this.initialData.perfil || "solicitante";
        }
      } else {
        // Resetar form ao fechar
        this.form = {
          usuario_id: "",
          perfil: "solicitante",
        };
      }
    },
  },
  methods: {
    openModal() {
      this.isOpen = true;
    },
    closeModal() {
      this.isOpen = false;
    },
    loadData() {
      const context = {
        $axios: this.parentContext.$axios,
        $store: this.parentContext.$store,
        $toastr: this.parentContext.$toastr,
      };

      Funcoes.listBySetor(context, this.setorId).then((linked) => {
        this.linkedUsers = linked || [];
        Funcoes.listAllUsers(context).then((all) => {
          const linkedIds = new Set((this.linkedUsers || []).map((u) => u.id));
          this.availableUsers = (all || []).filter((u) => !linkedIds.has(u.id));
        });
      });
    },
    submit() {
      const context = {
        $axios: this.parentContext.$axios,
        $store: this.parentContext.$store,
        $toastr: this.parentContext.$toastr,
      };

      if (this.mode === "ADD") {
        if (!this.form.usuario_id) {
          error("Erro!", "Selecione um usuário");
          return;
        }
        const payload = {
          usuario_id: this.form.usuario_id,
          setor_id: this.setorId,
          perfil: this.form.perfil,
        };
        Funcoes.create(context, payload)
          .then((resp) => {
            if (resp && resp.status) {
              success("Sucesso!", "Vínculo criado com sucesso");
              this.closeModal();
              this.$emit("changed");
            } else {
              const msg = resp?.message || "Erro ao criar vínculo";
              error("Erro!", msg);
            }
          })
          .catch((err) => {
            const status = err?.response?.status;
            if (status === 409) {
              error("Erro!", "Vínculo já existe");
            } else if (status === 422) {
              const erros =
                err.response?.data?.erros || err.response?.data?.errors || {};
              let msg = "";
              for (let f in erros)
                msg += (erros[f].join ? erros[f].join("\n") : erros[f]) + "\n";
              error("Erro de validação!", msg);
            } else {
              error("Erro!", "Erro ao criar vínculo");
            }
          });
      } else {
        const payload = {
          usuario_id: this.form.usuario_id || this.initialData.usuario_id,
          setor_id: this.setorId,
          perfil: this.form.perfil,
        };
        Funcoes.update(context, payload)
          .then((resp) => {
            if (resp && resp.status) {
              success("Sucesso!", "Perfil atualizado com sucesso");
              this.closeModal();
              this.$emit("changed");
            } else {
              const msg = resp?.message || "Erro ao atualizar vínculo";
              error("Erro!", msg);
            }
          })
          .catch((err) => {
            if (err?.response?.status === 422) {
              const erros =
                err.response?.data?.erros || err.response?.data?.errors || {};
              let msg = "";
              for (let f in erros)
                msg += (erros[f].join ? erros[f].join("\n") : erros[f]) + "\n";
              error("Erro de validação!", msg);
            } else {
              error("Erro!", "Erro ao atualizar vínculo");
            }
          });
      }
    },
  },
};
</script>

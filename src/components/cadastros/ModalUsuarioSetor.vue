<template>
  <span>
    <ModalBase01
      :idModal="idModal"
      modalClass="modal-dialog modal-lg modal-dialog-centered"
    >
      <div class="col-md-12">
        <div
          class="tab-content text-muted mt-4 mt-md-0"
          id="v-pills-tabContent"
        >
          <div
            class="tab-pane fade show active"
            id="aba_dados"
            role="tabpanel"
            aria-labelledby="aba_dados-tab"
          >
            <form autocomplete="off">
              <div class="row" v-if="mode === 'ADD'">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Usuário *</label>
                    <select class="form-select" v-model="form.usuario_id">
                      <option value="">Selecione um usuário</option>
                      <option
                        v-for="u in availableUsers"
                        :key="u.id"
                        :value="u.id"
                      >
                        {{ u.name }} - {{ u.email }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Perfil *</label>
                    <select class="form-select" v-model="form.perfil">
                      <option value="admin">Admin</option>
                      <option value="almoxarife">Almoxarife</option>
                      <option value="solicitante">Solicitante</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="row" v-else>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Perfil *</label>
                    <select class="form-select" v-model="form.perfil">
                      <option value="admin">Admin</option>
                      <option value="almoxarife">Almoxarife</option>
                      <option value="solicitante">Solicitante</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-12 text-end">
          <div class="d-flex gap-2 justify-content-end">
            <button
              type="button"
              class="btn btn-secondary btn-modal"
              data-bs-dismiss="modal"
              @click="close"
            >
              <i class="mdi mdi-close-thick me-2"></i>Fechar
            </button>
            <button
              type="submit"
              class="btn btn-success btn-modal"
              id="btn-save-usuario-setor"
              @click="submit"
            >
              <i class="mdi mdi-check-bold me-2"></i>
              {{ mode === "ADD" ? "Adicionar" : "Atualizar" }}
            </button>
          </div>
        </div>
      </div>
    </ModalBase01>
  </span>
</template>

<script>
import ModalBase01 from "@/components/layouts/ModalBase01.vue";
import Funcoes from "@/functions/cad_usuario_setor.js";

export default {
  name: "ModalUsuarioSetor",
  components: { ModalBase01 },
  props: {
    idModal: { type: String, required: true },
    setorId: { type: [Number, String], required: true },
    mode: { type: String, default: "ADD" }, // 'ADD' or 'UP'
    initialData: { type: Object, default: () => ({}) },
    functions: { type: Object, default: () => Funcoes },
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
  mounted() {
    this.loadData();
    if (this.mode === "UP" && this.initialData) {
      this.form.usuario_id = this.initialData.usuario_id;
      this.form.perfil = this.initialData.perfil || "solicitante";
    }
  },
  methods: {
    close() {
      try {
        const modal = document.getElementById(this.idModal);
        if (modal && window.bootstrap && window.bootstrap.Modal) {
          const inst = window.bootstrap.Modal.getInstance(modal);
          if (inst) inst.hide();
        }
      } catch (e) {
        console.warn("Erro ao fechar modal:", e);
      }
    },
    loadData() {
      // Carrega usuários já vinculados ao setor
      Funcoes.listBySetor(this, this.setorId).then((linked) => {
        this.linkedUsers = linked || [];
        // Carrega todos os usuários e filtra os já vinculados
        Funcoes.listAllUsers(this).then((all) => {
          const linkedIds = new Set((this.linkedUsers || []).map((u) => u.id));
          this.availableUsers = (all || []).filter((u) => !linkedIds.has(u.id));
        });
      });
    },
    submit() {
      if (this.mode === "ADD") {
        if (!this.form.usuario_id) {
          alert("Selecione um usuário");
          return;
        }
        const payload = {
          usuario_id: this.form.usuario_id,
          setor_id: this.setorId,
          perfil: this.form.perfil,
        };
        Funcoes.create(this, payload)
          .then((resp) => {
            if (resp && resp.status) {
              if (this.$toastr) this.$toastr.s("Vínculo criado com sucesso");
              else alert("Vínculo criado com sucesso");
              this.close();
              this.$emit("changed");
            } else {
              const msg = resp?.message || "Erro ao criar vínculo";
              if (this.$toastr) this.$toastr.e(msg);
              else alert(msg);
            }
          })
          .catch((err) => {
            const status = err?.response?.status;
            if (status === 409) {
              if (this.$toastr) this.$toastr.e("Vínculo já existe");
              else alert("Vínculo já existe");
            } else if (status === 422) {
              const erros =
                err.response?.data?.erros || err.response?.data?.errors || {};
              let msg = "";
              for (let f in erros)
                msg += (erros[f].join ? erros[f].join("\n") : erros[f]) + "\n";
              if (this.$toastr) this.$toastr.e(msg);
              else alert(msg);
            } else {
              if (this.$toastr) this.$toastr.e("Erro ao criar vínculo");
              else alert("Erro ao criar vínculo");
            }
          });
      } else {
        // Update perfil
        const payload = {
          usuario_id: this.form.usuario_id || this.initialData.usuario_id,
          setor_id: this.setorId,
          perfil: this.form.perfil,
        };
        Funcoes.update(this, payload)
          .then((resp) => {
            if (resp && resp.status) {
              if (this.$toastr) this.$toastr.s("Perfil atualizado com sucesso");
              else alert("Perfil atualizado com sucesso");
              this.close();
              this.$emit("changed");
            } else {
              const msg = resp?.message || "Erro ao atualizar vínculo";
              if (this.$toastr) this.$toastr.e(msg);
              else alert(msg);
            }
          })
          .catch((err) => {
            if (err?.response?.status === 422) {
              const erros =
                err.response?.data?.erros || err.response?.data?.errors || {};
              let msg = "";
              for (let f in erros)
                msg += (erros[f].join ? erros[f].join("\n") : erros[f]) + "\n";
              if (this.$toastr) this.$toastr.e(msg);
              else alert(msg);
            } else {
              if (this.$toastr) this.$toastr.e("Erro ao atualizar vínculo");
              else alert("Erro ao atualizar vínculo");
            }
          });
      }
    },
  },
};
</script>

<style scoped>
.btn-modal {
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.6rem 1.25rem;
  border-radius: 0.4rem;
}
</style>

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
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label">Razão Social / Nome</label>
                    <input
                      type="text"
                      class="form-control text-uppercase"
                      v-model="modalData.razao_social_nome"
                    />
                    <div
                      v-if="fieldError('razao_social_nome')"
                      class="invalid-feedback d-block"
                    >
                      {{ fieldError("razao_social_nome") }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">Código</label>
                    <input
                      type="text"
                      class="form-control text-uppercase"
                      v-model="modalData.codigo"
                    />
                  </div>
                </div>

                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">Tipo Pessoa</label>
                    <select class="form-select" v-model="modalData.tipo_pessoa">
                      <option value="J">Pessoa Jurídica</option>
                      <option value="F">Pessoa Física</option>
                    </select>
                  </div>
                </div>

                <div class="col-md-3">
                  <div v-if="modalData.tipo_pessoa === 'J'">
                    <div class="mb-3">
                      <label class="form-label">CNPJ</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="modalData.cnpj"
                        v-mask="'##.###.###/####-##'"
                      />
                      <div
                        v-if="fieldError('cnpj')"
                        class="invalid-feedback d-block"
                      >
                        {{ fieldError("cnpj") }}
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <div class="mb-3">
                      <label class="form-label">CPF</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="modalData.cpf"
                        v-mask="'###.###.###-##'"
                      />
                      <div
                        v-if="fieldError('cpf')"
                        class="invalid-feedback d-block"
                      >
                        {{ fieldError("cpf") }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">Status</label>
                    <select class="form-select" v-model="modalData.status">
                      <option value="A">Ativo</option>
                      <option value="I">Inativo</option>
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
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            <i class="mdi mdi-close-thick font-size-15"></i> Fechar
          </button>
          <button
            type="submit"
            class="btn btn-success"
            id="btn-save-event"
            @click="add_UP_Fornecedor"
          >
            <i class="mdi mdi-check-bold font-size-15"></i>
            {{ modalFunction === "ADD" ? "Salvar" : "Atualizar" }}
          </button>
        </div>
      </div>
    </ModalBase01>
  </span>
</template>

<script>
import ModalBase01 from "@/components/layouts/ModalBase01.vue";

export default {
  name: "ModalFornecedores",
  components: { ModalBase01 },
  props: ["idModal", "functions"],
  computed: {
    modalData() {
      return this.$store.state.modalData.modalData;
    },
    modalFunction() {
      return this.$store.state.modalData.modalFunction;
    },
    modalErrors() {
      return this.$store.state.modalErrors || {};
    },
  },
  methods: {
    add_UP_Fornecedor() {
      // limpa erros anteriores
      try {
        this.$store.commit("setModalErrors", {});
      } catch (e) {}
      // Validação mínima do CPF/CNPJ conforme tipo_pessoa
      const tipo = this.modalData.tipo_pessoa || "J";
      const onlyDigits = (s) => (s || "").toString().replace(/\D/g, "");

      // Sanitiza e valida comprimento exato
      const payloadData = JSON.parse(JSON.stringify(this.modalData));
      if (payloadData.cnpj) payloadData.cnpj = onlyDigits(payloadData.cnpj);
      if (payloadData.cpf) payloadData.cpf = onlyDigits(payloadData.cpf);

      if (tipo === "J") {
        const cnpj = payloadData.cnpj || "";
        if (!cnpj || cnpj.length !== 14) {
          this.$store.commit("setModalErrors", {
            cnpj: ["CNPJ deve ter exatamente 14 dígitos"],
          });
          this.$toastr.e(
            "Informe um CNPJ válido para Pessoa Jurídica (14 dígitos)."
          );
          return;
        }
        // garante cpf vazio
        payloadData.cpf = null;
      } else {
        const cpf = payloadData.cpf || "";
        if (!cpf || cpf.length !== 11) {
          this.$store.commit("setModalErrors", {
            cpf: ["CPF deve ter exatamente 11 dígitos"],
          });
          this.$toastr.e(
            "Informe um CPF válido para Pessoa Física (11 dígitos)."
          );
          return;
        }
        // garante cnpj vazio
        payloadData.cnpj = null;
      }

      // Renomeia razao_social -> razao_social_nome para obedecer à API
      if (payloadData.razao_social) {
        payloadData.razao_social_nome = payloadData.razao_social;
        delete payloadData.razao_social;
      }

      const content = {
        $axios: this.$axios,
        $store: this.$store,
        $toastr: this.$toastr,
        modalData: payloadData,
      };

      if (this.functions && this.functions.ADD_UP) {
        this.functions.ADD_UP(
          content,
          this.modalFunction === "ADD" ? "ADD" : "UP"
        );
      }
    },
    fieldError(field) {
      const errors = this.modalErrors || {};
      if (!errors) return null;
      // backend pode retornar { campo: ["msg1","msg2"] } ou { campo: "msg" }
      const v = errors[field];
      if (!v) return null;
      if (Array.isArray(v)) return v[0];
      return v;
    },
  },
};
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4a4a4a;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background-color: #4a4a4a;
  color: white;
  border: none;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

@media (max-width: 768px) {
}
</style>

<template>
  <span>
    <ModalBase01 :id="idModal" modalClass="modal-dialog modal-lg modal-dialog-centered">
      <div class="col-md-12">
        <div class="tab-content text-muted mt-4 mt-md-0" id="v-pills-tabContent">
          <div class="tab-pane fade show active" id="aba_dados" role="tabanel" aria-labelledby="aba_dados-tab">
            <form autocomplete="off">
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <div class="form-label">Status</div>
                    <select class="form-select" v-model="modalData.status">
                      <option value="A">Ativo</option>
                      <option value="I">Inativo</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="SetorCodigo">Código da Setor</label>
                    <input type="text" class="form-control" id="SetorCodigo" placeholder=""
                      v-model="modalData.codigo_setor">
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="SetorCodigo">Estoque</label>
                    <select class="form-select" v-model="modalData.estoque">
                      <option value="S">Sim</option>
                      <option value="N">Não</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label" for="SetorNome">Nome</label>
                    <input type="text" class="form-control text-uppercase" id="SetorNome" placeholder=""
                      v-model="modalData.nome">
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label" for="SetorDescricao">Descrição</label>
                    <input type="text" class="form-control" id="SetorDescricao" placeholder=""
                      v-model="modalData.descricao">
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="row mmt-2">
        <div class="col-12 text-end">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="mdi mdi-close-thick font-size-15"></i> Fechar</button>
          <button type="submit" class="btn btn-success" data-bs-target="#success-btn" id="btn-save-event"
            v-on:click="add_UP_Setores()"><i class="mdi mdi-check-bold font-size-15"></i> {{
              modalFunction == 'ADD' ? 'Salvar' : 'Atualizar' }}</button>
        </div>
      </div>
    </ModalBase01>
  </span>
</template>

<script>

import ModalBase01 from '@/components/layouts/ModalBase01.vue';
import Funcoes from '@/functions/cad_setores.js';

export default {
  name: 'ModalSetores',
  components: {
    ModalBase01,
    Funcoes
  },
  props: ['idModal', 'functions'],
  data() {
    return {

    };
  },
  mounted() {

  },
  methods: {
    add_UP_Setores() {
      const content = {
        $axios: this.$axios,
        $store: this.$store,
        $toastr: this.$toastr,
        modalData: JSON.parse(JSON.stringify(this.modalData))
      };
      this.functions.ADD_UP(content, this.modalFunction);
    }
  },
  computed: {
    modalTitle() {
      return this.$store.state.modalData.modalTitle;
    },
    modalData() {
      return this.$store.state.modalData.modalData;
    },
    modalFunction() {
      return this.$store.state.modalData.modalFunction;
    }
  },
  state: {
    modalData: {
      status: 'A',
      nome: '',
      descricao: '',
    }
  },
  mutations: {
    setModalData(state, payload) {
      state.modalData = {
        ...state.modalData,
        ...payload 
      };
    },
  }
}

</script>

<style scoped>
.user-form {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr;
}

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
  .user-form {
    grid-template-columns: 1fr;
  }
}
</style>
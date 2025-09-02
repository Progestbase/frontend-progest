<template>
  <span>
    <ModalBase01 :id="idModal" modalClass="modal-dialog modal-lg modal-dialog-centered">
      <div class="col-md-12">
        <div class="tab-content text-muted mt-4 mt-md-0" id="v-pills-tabContent">
          <div class="tab-pane fade show active" id="aba_dados" role="tabpanel" aria-labelledby="aba_dados-tab">
            <form autocomplete="off">
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Status</label>
                    <select class="form-select" v-model="modalData.status">
                      <option value="A">Ativo</option>
                      <option value="I">Inativo</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="Matricula">Matricula</label>
                    <input type="text" class="form-control text-uppercase" placeholder="" v-model="modalData.matricula">
                  </div>
                </div>
                <!-- Perfis do usuário -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="UserPerfil">Perfil</label>
                    <select class="form-select" v-model="modalData.perfil">
                      <option v-for="perfil in listPerfisStore" :key="perfil.id" :value="perfil.id">
                        {{ perfil.nome }}
                      </option>
                    </select>
                  </div>
                </div>
                <!-- Tipos de vínculo -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="UserTipoVinculo">Tipo de Vínculo</label>
                    <select class="form-select" v-model="modalData.tipo_vinculo">
                      <option v-for="tipo in listTiposVinculoStore" :key="tipo.id" :value="tipo.id">
                        {{ tipo.nome }}
                      </option>
                    </select>
                  </div>
                </div>
                <!-- Setor do usuário -->
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="UserSetor">Setor</label>
                    <select class="form-select" v-model="modalData.setor">
                      <option v-for="setor in listSetoresStore" :key="setor.id" :value="setor.id">
                        {{ setor.nome }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="UserCpf">CPF</label>
                    <input type="text" class="form-control text-uppercase" placeholder="" v-model="modalData.cpf"
                      v-mask="'###.###.###-##'">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label" for="UserNome">Nome</label>
                    <input type="text" class="form-control text-uppercase" placeholder="" v-model="modalData.name">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label" for="UserEmail">E-mail</label>
                    <input type="text" class="form-control text-lowercase" placeholder="" v-model="modalData.email">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="UserTelefone">Telefone</label>
                    <input type="text" class="form-control" placeholder="(99) 99999-9999" v-model="modalData.telefone"
                      v-mask="'(##) #####-####'">
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="UserNascimento">Data de Nascimento</label>
                    <input type="text" class="form-control" placeholder="dd/mm/aaaa" v-model="modalData.nascimento"
                      v-mask="'##/##/####'">
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label" for="UserPassword">Senha</label>
                    <input type="password" class="form-control" placeholder="" v-model="modalData.password">
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="row mt-2">
        <div class="col-12 text-end">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="mdi mdi-close-thick font-size-15"></i> Fechar</button>
          <button type="submit" class="btn btn-success" data-bs-target="#success-btn" id="btn-save-event"
            v-on:click="add_UP_User()"><i class="mdi mdi-check-bold font-size-15"></i> {{
              modalFunction === 'ADD' ? 'Salvar' : 'Atualizar' }}</button>
        </div>
      </div>
    </ModalBase01>
  </span>
</template>

<script>
import ModalBase01 from '@/components/layouts/ModalBase01.vue';
import Funcoes from '@/functions/cad_usuarios.js';

export default {
  name: 'ModalUser01',
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
    this.listPerfis();
    this.listTiposVinculo();
    this.listSetores();
  },
  methods: {
    add_UP_User() {
      const content = {
        $axios: this.$axios,
        $store: this.$store,
        $toastr: this.$toastr,
        modalData: {
          ...this.modalData,
          perfil: this.modalData.perfil,
          tipo_vinculo: this.modalData.tipo_vinculo,
          setor: this.modalData.setor,
        }
      };
      this.functions.ADD_UP(this, this.modalFunction);
    },
    listPerfis() {
      Funcoes.listPerfis(this);
    },
    listTiposVinculo() {
      Funcoes.listTiposVinculo(this);
    },
    listSetores() {
      Funcoes.listSetores(this);
    },
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
    },
    listPerfisStore() {
      return this.$store.state.listPerfis || [];
    },
    listTiposVinculoStore() {
      return this.$store.state.listTiposVinculo || [];
    },
    listSetoresStore() {
      return this.$store.state.listSetores;
    },
  },
  state: {
    modalData: {
    },
  },
  mutations: {
    setModalData(state, payload) {
      state.modalData = {
        ...state.modalData, 
        ...payload     
      };
    },

    resetModalData(state) {
      state.modalData = {

      };
    }
  }
};
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
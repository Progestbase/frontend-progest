<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <button class="btn btn-success">
                    <LinkModal01 :idModalInsertUP="'#addUPUser'" :label="'NOVO'" :titleModal="titleModal"
                      :varsModalData="varsModalData">
                    </LinkModal01>
                  </button>
                  <!-- Listagem de usuários aqui -->
                  <div class="mt-5">
                    <!-- Tabela de listagem de itens -->
                    <TBLBASE01 v-if="listUsers && listUsers.length > 0" :list="listUsers"
                          :titles="['#', 'Nome', 'cpf', 'Matricula', 'Data de Nascimento', 'Status', 'Tipo', 'Unidade', 'Perfil', 'Tipo de Vínculo', 'Setor']"
                          :align="['text-center', 'text-left', 'text-left', 'text-left', 'text-left', 'text-left', 'text-left', 'text-left', 'text-left', 'text-left']" :indexLink="1"
                      :idModalUP="'#addUPUser'" :functions="functions" classColTable="12" 
                      deleteRoute="/user/delete"
                      />
                    <!-- Paginação da tabela -->
                    <!-- <PAGINACAOBASE01 :paginacaoData="listUsers" :functions="functions">
                    </PAGINACAOBASE01> -->
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ModalUser01 idModal="addUPUser" :functions="functions"></ModalUser01>


        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import LinkModal01 from "@/components/layouts/LinkModal01.vue"
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalUser01 from "@/components/cadastros/ModalUser01.vue";
import TBLBASE01 from '@/components/layouts/TableBase01.vue';

import functions from "../../functions/cad_usuarios.js";

export default {
  name: 'UsersView',
  components: {
    LinkModal01,
    TemplateAdmin,
    ModalUser01,
    TBLBASE01,
  },
  data() {
    return {
      isCreateUserModalOpen: false,
      user_data: null,
      functions: functions,
      choice_filters: null,
      titleModal: 'Cadastro de Usuário',
      varsModalData: {
        status: 'A',
        matricula: '',
        funcao: 'L',
        name: '',
        cpf: '',
        email: '',
        password: ''
      }
    };
  },
  methods: {
    openCreateUserModal() {
      this.isCreateUserModalOpen = true;
    },
    closeCreateUserModal() {
      this.isCreateUserModalOpen = false;
    },
    createUser(userData) {
      console.log("Usuário criado:", userData);
      alert("Usuário cadastrado com sucesso!");
      this.closeCreateUserModal();
    },
    listAllUsers() {
      functions.listALL(this);
    }
  },
  computed: {
    listUsers() {
      return this.$store.state.listUsers;
    },
  },
  created() {

  },
  mounted() {
    this.listAllUsers();
  },
};
</script>

<style scoped>
.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4a4a4a;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-control {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  padding: 0.5rem;
}

.btn-primary {
  background-color: var(--dark);
  border-color: var(--dark);
  font-size: 1rem;
  font-weight: bold;
  border-radius: 0.25rem;
}
</style>
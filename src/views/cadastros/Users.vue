<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <LinkModal01
                    :idModalInsertUP="'#addUPUser'"
                    :label="'NOVO'"
                    :titleModal="titleModal"
                    :varsModalData="varsModalData"
                  >
                  </LinkModal01>

                  <div class="mt-5">
                    <!-- Loading -->
                    <div
                      v-if="$store.state.isSearching"
                      class="text-center mt-5"
                    >
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                      </div>
                      <p class="mt-2">Carregando usuários...</p>
                    </div>

                    <!-- Tabela com dados -->
                    <TBLBASE01
                      v-else-if="listUsers && listUsers.length > 0"
                      :list="listUsers"
                      :titles="[
                        '#',
                        'Nome',
                        'E-mail',
                        'CPF',
                        'Telefone',
                        'Data de Nascimento',
                        'Status',
                        'Tipo de Vínculo',
                      ]"
                      :align="[
                        'text-center',
                        'text-left',
                        'text-left',
                        'text-left',
                        'text-left',
                        'text-left',
                        'text-left',
                        'text-center',
                      ]"
                      :indexLink="1"
                      :idModalUP="'#addUPUser'"
                      :functions="functions"
                      classColTable="12"
                      deleteRoute="/user/delete"
                    />

                    <!-- Estado vazio -->
                    <div v-else class="text-center p-5">
                      <div class="mb-3">
                        <i
                          class="mdi mdi-account-outline text-muted"
                          style="font-size: 3rem"
                        ></i>
                      </div>
                      <h5 class="text-muted">Nenhum usuário encontrado</h5>
                      <p class="text-muted">
                        Clique em "NOVO" para cadastrar o primeiro usuário.
                      </p>
                    </div>

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
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalUser01 from "@/components/cadastros/ModalUser01.vue";
import TBLBASE01 from "@/components/layouts/TableBase01.vue";

import functions from "../../functions/cad_usuarios.js";

export default {
  name: "UsersView",
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
      titleModal: "Cadastro de Usuário",
      varsModalData: {
        status: "A",
        name: "",
        cpf: "",
        email: "",
        telefone: "",
        data_nascimento: "",
        tipo_vinculo: "",
        password: "",
      },
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
      // Carrega apenas tipos de vínculo antes de listar usuários. Vinculação a setores/unidades
      // deixou de ser responsabilidade deste módulo.
      functions
        .listTiposVinculo(this)
        .then(() => {
          functions.listALL(this);
        })
        .catch(() => {
          functions.listALL(this);
        });
    },
  },
  computed: {
    listUsers() {
      return this.$store.state.listUsers;
    },
  },
  created() {},
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

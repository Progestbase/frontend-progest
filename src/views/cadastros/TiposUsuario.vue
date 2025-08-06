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
                                        <LinkModal01 :idModalInsertUP="'#addUPTiposUsuario'" :label="'NOVO'"
                                            :titleModal="titleModal" :varsModalData="varsModalData">
                                        </LinkModal01>
                                    </button>
                                    <div class="mt-5">
                                        <TBLBASE01 v-if="listTiposUsuario"
                                            :list="listTiposUsuario" :titles="['#', 'Nome', 'Descricao', 'Status']"
                                            :align="['text-center', 'text-left', 'text-left']"
                                            :indexLink="1" :idModalUP="'#addUPTiposUsuario'" :functions="functions"
                                            classColTable="12" deleteRoute="/tiposUsuario/delete" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ModalTiposUsuario idModal="addUPTiposUsuario" :functions="functions"></ModalTiposUsuario>
                </div>
            </div>
        </div>
    </TemplateAdmin>
</template>

<script>

import LinkModal01 from "../../components/layouts/LinkModal01.vue";
import TemplateAdmin from "../roleAdmin/TemplateAdmin.vue";
import ModalTiposUsuario from "../../components/cadastros/ModalTiposUsuario.vue";
import TBLBASE01 from '@/components/layouts/TableBase01.vue';

import functions from "../../functions/cad_tipos_usuario.js";

export default {
    name: 'TipoUsuarioView',
    components: {
        LinkModal01,
        TemplateAdmin,
        ModalTiposUsuario,
        TBLBASE01
    },
    data() {
        return {
            isCreateModalTiposUsuarioOpen: false,
            tipos_usuario_data: null,
            functions: functions,
            choice_filters: null,
            titleModal: 'Cadastro de Tipos de Usuários',
            varsModalData: {
                status: 'A',
                nome: '',
                descricao: ''
            }
        }
    },
    methods: {
        openCreateTiposUsuarioModal() {
            this.isCreateModalTiposUsuarioOpen = true;
        },
        closeCreateTiposUsuarioModal() {
            this.isCreateModalTiposUsuarioOpen = false;
        },
        createTiposUsuario(userData) {
            console.log("usuário criado:", userData);
            alert("Usuário Cadastrado com sucesso!");
            this.closeCreateTiposUsuarioModal();
        },
        listAllTiposUsuario() {
            functions.listAll(this);
        }
    },
    computed: {
        listTiposUsuario() {
            return this.$store.state.listTiposUsuario;
        },
    },
    created() {

    },
    mounted() {
        this.listAllTiposUsuario();
    }
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
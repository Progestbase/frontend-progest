<template>
    <TemplateAdmin>
        <div class="main-content">
            <div class="page-content">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body">
                                    <LinkModal01 :idModalInsertUP="'#addUPUnidade'" :label="'NOVO'"
                                        :titleModal="titleModal" :varsModalData="varsModalData">
                                    </LinkModal01>
                                    <div class="mt-5">
                                        <TBLBASE01
                                            v-if="listUnidades"
                                            :list="listUnidades" :titles="['#', 'Nome', 'Código', 'Descrição', 'Status']"
                                            :align="['text-center', 'text-left']" :indexLink="1"
                                            :idModalUP="'#addUPUnidade'" :functions="functions" classColTable="12" 
                                            deleteRoute="/unidades/delete" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ModalUnidades idModal="addUPUnidade" :functions="functions"></ModalUnidades>

                    </div>
                </div>
            </div>
        </div>
    </TemplateAdmin>
</template>

<script>

import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalUnidades from "@/components/cadastros/ModalUnidades.vue";
import TBLBASE01 from "@/components/layouts/TableBase01.vue";

import functions from "../../functions/cad_unidades.js";


export default {
    name: 'UnidadesView',
    components: {
        LinkModal01,
        TemplateAdmin,
        ModalUnidades,
        TBLBASE01,
    },
    data() {
        return {
            isCreateModalUnidadeOpen: false,
            unidade_data: null,
            functions: functions,
            choice_filters: null,
            titleModal: 'Cadastro de Unidades',
            varsModalData: {
                status: 'A',
                nome: '',
                descricao: ''
            }
        }
    },
    methods: {
        openCreateUnidadeModal() {
            this.isCreateUnidadeModalOpen = true;
        },
        listAllUnidades() {
            functions.listAll(this);
        },
    },
    computed: {
        listUnidades() {
            return this.$store.state.listUnidades;
        }
    },
    created() {

    },
    mounted() {
        this.listAllUnidades();
    }
}

</script>

<style>
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
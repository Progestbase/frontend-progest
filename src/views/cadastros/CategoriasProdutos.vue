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
                                        <LinkModal01 :idModalInsertUP="'#addUPCategoriasProdutos'" :label="'NOVO'"
                                            :titleModal="titleModal" :varsModalData="varsModalData">
                                        </LinkModal01>
                                    </button>
                                    <div class="mt-5">
                                        <TBLBASE01 v-if="listCategoriasProdutos && listCategoriasProdutos.data && listCategoriasProdutos.data.length > 0"
                                            :list="listCategoriasProdutos" :titles="['#', 'Nome', 'Descricao', 'Status']"
                                            :align="['text-center', 'text-left', 'text-left']"
                                            :indexLink="1" :idModalUP="'#addUPCategoriasProdutos'" :functions="functions"
                                            classColTable="12" />
                                        <div v-else class="text-center p-4">
                                            <p>Nenhuma categoria de produto encontrada.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ModalCategoriasProdutos idModal="addUPCategoriasProdutos" :functions="functions"></ModalCategoriasProdutos>

                    </div>
                </div>
            </div>
        </div>
    </TemplateAdmin>
</template>

<script>

import LinkModal01 from "@/components/layouts/LinkModal01.vue"; 
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalCategoriasProdutos from "@/components/cadastros/ModalCategoriasProdutos.vue";
import TBLBASE01 from "@/components/layouts/TableBase01.vue";

import functions from "../../functions/cad_categorias_produtos.js";


export default {
    name: 'CategoriasProdutosView',
    components: {
        LinkModal01,
        TemplateAdmin,
        ModalCategoriasProdutos,
        TBLBASE01,
    },
    data() {
        return {
            isCreateModalCategoriasProdutosOpen: false,
            categoriasProdutos_data: null,
            functions: functions,
            choice_filters: null,
            titleModal: 'Categorias de Produtos',
            varsModalData: {
                status: 'A',
                nome: '',
                descricao: ''
            }
        }
    },
    methods: {
        openCreateCategoriasProdutosModal() {
            this.isCreateCategoriasProdutosModalOpen = true;
        },
        listAllCategoriasProdutos() {
            functions.listAll(this);
        },
    },
    computed: {
        listCategoriasProdutos() {
            console.log('Dados no computed:', this.$store.state.listCategoriasProdutos);
            return this.$store.state.listCategoriasProdutos;
        }
    },
    created() {

    },
    mounted() {
        this.listAllCategoriasProdutos();
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
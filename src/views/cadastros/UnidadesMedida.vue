<template>
    <TemplateAdmin>
        <div class="main-content">
            <div class="page-content">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body">
                                    <LinkModal01 :idModalInsertUP="'#addUPUnidadesMedida'" :label="'NOVO'"
                                        :titleModal="titleModal" :varsModalData="varsModalData">
                                    </LinkModal01>
                                    <div class="mt-5">
                                        <TBLBASE01
                                            v-if="listUnidadesMedida"
                                            :list="listUnidadesMedida" :titles="['#', 'Nome', 'Descrição', 'Status']"
                                            :align="['text-center', 'text-left', 'text-left']" :indexLink="1"
                                            :idModalUP="'#addUPUnidadesMedida'" :functions="functions" classColTable="12" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ModalUnidadesMedida idModal="addUPUnidadesMedida" :functions="functions"></ModalUnidadesMedida>

                    </div>
                </div>
            </div>
        </div>
    </TemplateAdmin>
</template> 

<script>
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalUnidadesMedida from "@/components/cadastros/ModalUnidadesMedida.vue";
import TBLBASE01 from "@/components/layouts/TableBase01.vue";

import functions from "../../functions/cad_unidades_medida.js";

export default {
    name: 'UnidadesMedidaView',
    components: {
        LinkModal01,
        TemplateAdmin,
        ModalUnidadesMedida,
        TBLBASE01,
    },
    data() {
        return {
            listUnidadesMedida: [],
            functions: functions,
            titleModal: 'Unidades de Medida',
            varsModalData: {
                status: 'A',
                nome: '',
                codigo: '',
                descricao: ''
            }
        }
    },
    methods: {
        openCreateUnidadesMedidaModal() {
            this.isCreateUnidadesMedidaModalOpen = true;
        },
        listAllUnidadesMedida() {
            functions.listAll(this);
        }
    },
    computed: {
        listUnidadesMedida() {
            return this.$store.state.listUnidadesMedida;
        }
    },
    created() {
        this.listAllUnidadesMedida();
    },
    mounted() {
        this.listAllUnidadesMedida();
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
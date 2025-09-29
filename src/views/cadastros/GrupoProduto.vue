<template>
    <TemplateAdmin>
        <div class="main-content">
            <div class="page-content">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body">
                                    <LinkModal01 :idModalInsertUP="'#addUPGrupoProduto'" :label="'NOVO'"
                                        :titleModal="titleModal" :varsModalData="varsModalData">
                                    </LinkModal01>
                                    <div class="mt-5">
                                        <TBLBASE01 v-if="listGrupoProdutos && listGrupoProdutos.length > 0"
                                            :list="formattedList" :titles="['#', 'Nome', 'Tipo', 'Status']"
                                            :align="['text-center','text-left','text-left','text-center']"
                                            :indexLink="1" :idModalUP="'#addUPGrupoProduto'" :functions="functions"
                                            classColTable="12" deleteRoute="/grupoProduto/delete" />
                                        <div v-else class="text-center p-4">
                                            <p>Nenhum grupo de produto encontrado.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ModalGrupoProduto idModal="addUPGrupoProduto" :functions="functions"></ModalGrupoProduto>

                    </div>
                </div>
            </div>
        </div>
    </TemplateAdmin>
</template>

<script>
import LinkModal01 from "@/components/layouts/LinkModal01.vue";
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import ModalGrupoProduto from "@/components/cadastros/ModalGrupoProduto.vue";
import TBLBASE01 from "@/components/layouts/TableBase01.vue";

import functions from "../../functions/cad_grupo_produto.js";

export default {
    name: 'GrupoProdutoView',
    components: { LinkModal01, TemplateAdmin, ModalGrupoProduto, TBLBASE01 },
    data() {
        return {
            functions: functions,
            titleModal: 'Grupos de Produtos',
            varsModalData: { status: 'A', nome: '', tipo: 'Material' }
        }
    },
    methods: {
        listAll() { functions.listAll(this); }
    },
    computed: {
        listGrupoProdutos() { return this.$store.state.listGrupoProdutos?.data || []; },
        formattedList() {
            return this.listGrupoProdutos.map(g => ({ id: g.id, nome: g.nome, tipo: g.tipo, status: g.status === 'A' ? 'Ativo' : 'Inativo' }));
        }
    },
    created() { this.listAll(); },
    mounted() { this.listAll(); }
}
</script>

<style>
.modal-title { font-size: 1.5rem; font-weight: bold; color: #4a4a4a; display: flex; align-items: center; margin-bottom: 1rem; }
.form-control { background-color: #f8f9fa; border: 1px solid #ced4da; border-radius: 0.25rem; padding: 0.5rem; }
.btn-primary { background-color: var(--dark); border-color: var(--dark); font-size: 1rem; font-weight: bold; border-radius: 0.25rem; }
</style>

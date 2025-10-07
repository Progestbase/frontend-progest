<template>
    <TemplateAdmin>

    </TemplateAdmin>
</template>

<script>

import LinkModal01 from '../../components/layouts/LinkModal01.vue';
import TemplateAdmin from '../roleAdmin/TemplateAdmin.vue';
import ModalPerfis from '../../components/cadastros/ModalPerfis.vue';
import TBLBASE01 from '../../components/layouts/TableBase01.vue';

import functions from '../../functions/cad_perfis.js';

export default {
    name: 'PerfisView',
    components: {
        LinkModal01,
        TemplateAdmin,
        ModalPerfis,
        TBLBASE01
    },
    data() {
        return {
            isCreateModalPerfilOpen: false,
            perfil_data: null,
            functions: functions,
            choice_filters: null,
            titleModal: 'Cadastro de Perfis',
            varsModalData: {
                status: 'A',
                nome: '',
                descricao: ''
            }
        }
    },
    methods: {
        openCreatePerfilModal() {
            this.isCreateModalPerfilOpen = true;
        },
        listAllPerfis() {
            functions.listAll(this);
        }   
    },
    computed: {
        listPerfis() {
            return this.$store.state.listPerfis
        }
    },
    created() {

    },
    // mounted() {
    //     this.listAllPerfis();
    // }
}

</script>
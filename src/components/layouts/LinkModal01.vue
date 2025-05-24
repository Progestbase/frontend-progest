<template>
    <span>
        <span v-if="!dataList">
            <button type="button" class="btn btn-success" data-bs-toggle="modal" :data-bs-target="idModalInsertUP"
                style="font-size: 10px;" v-on:click="preencheForm('create')">
                <i class="mdi mdi-plus-thick d-block font-size-15"></i>
                {{ label }}
            </button>
        </span>
        <span v-if="dataList">
            <a data-bs-toggle="modal" :data-bs-target="idModalInsertUP" v-on:click="preencheForm('edit', idData)"
                style="cursor: pointer; color: #3b76e1;">{{ label }}</a>
        </span>
    </span>
</template>

<script>
export default {
    name: '',
    props: ['idModalInsertUP', 'dataList', 'label', 'titleModal', 'functions', 'idData', 'varsModalData'],
    data() {
        return {
            msg: ''
        }
    },
    methods: {
    preencheForm(tipo, idData = null) {
        this.$store.commit("setModalTitle", this.titleModal);
        if (tipo == 'create') {
            this.$store.commit("setModalData", this.varsModalData);
            this.$store.commit("setModalFunction", "ADD");
            this.$nextTick(() => {
                setTimeout(() => {
                    const abaDadosTab = document.querySelector("#aba_dados-tab");
                    if (abaDadosTab) abaDadosTab.click();
                }, 100);
            });
        } else {
            // Monte o objeto corretamente
            this.functions.listData({
                $axios: this.$axios,
                $store: this.$store,
                $toastr: this.$toastr,
                idData: idData,
                callback: () => {
                    setTimeout(() => {
                        document.querySelector(this.idModalInsertUP).click();
                    }, 100);
                }
            });
            this.$store.commit("setModalFunction", "UP");
        }
    }
},
    mounted() {
    },
}
</script>

  <!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
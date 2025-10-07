<template>
    <span>
        <ModalBase01 :idModal="idModal" :modalTitle="modalTitle" :functions="functions" @actionModal="add_UP_Perfis">
            
        </ModalBase01>
    </span>
</template>


<script>

import ModalBase01 from "../layouts/ModalBase01.vue";
import Funcoes from "../../functions/cad_perfis.js";

export default {
    name: 'ModalPerfis',
    components: {
        ModalBase01,
        Funcoes
    },
    props: ['idModal', 'functions'],
    data() {
        return {

        }
    },
    mounted() {

    },
    methods: {
        add_UP_Perfis() {
            const content = {
                $axios: this.$axios,
                $store: this.$store,
                $toastr: this.$toastr,
                modalData: JSON.parse(JSON.stringify(this.modalData))
            };
            this.functions.ADD_UP(content, this.modalFunction);
        }
    },
    computed: {
        modalTitle() {
            return this.$store.state.modalTitle;
        },
        modalData() {
            return this.$store.state.modalData;
        },
        modalFunction() {
            return this.$store.state.modalFunction;
        }
    },
    state: {
        modalData: {
            status: 'A',
            nome: '',
            descricao: '',
        }
    },
    mutations: {
        setModalData(state, payload) {
            state.modalData = {
                ...state.modalData,
                ...payload
            }
        }
    }
}

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
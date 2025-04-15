<template>
    <TemplateAdmin>
        <div>
           <div class="main-content">
                <div class="page-content">
                    <div class="container-fluid">

                        <div class="row">
                            <div class="col-lg-12">
                                <div class="card">
                                    <div class="card-body">
                                        <button>Cadastra Usuário</button>
                                        <!-- Topo da Listagem -->

                                        <!-- filtros -->
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
           </div>
        </div>
    </TemplateAdmin>
</template>

<script>
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";


export default {
    name: 'DashboardView',
    components: {
        TemplateAdmin,
        
    },
    data() {
        return {
            isCreateUserModalOpen: false,
            newUser: {
                name: "",
                phone: "",
                email: "",
                password: "",
                unit: "",
                chief: "",
                profile: "Admin",
                status: "Active",
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
        createUser() {
            console.log("Usuário criado:", this.newUser);
            alert("Usuário cadastrado com sucesso!");
            this.closeCreateUserModal();
            this.resetForm();
        },
        resetForm() {
            this.newUser = {
                name: "",
                phone: "",
                email: "",
                password: "",
                unit: "",
                chief: "",
                profile: "Admin",
                status: "Active",
            };
        },
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
    background-color: #4a4a4a;
    border-color: #4a4a4a;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 0.25rem;
}
</style>
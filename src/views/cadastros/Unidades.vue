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
                    :idModalInsertUP="'#addUPUnidade '"
                    :label="'NOVA UNIDADE'"
                    :titleModal="titleModal"
                    :varsModalData="varsModalData"
                  >
                  </LinkModal01>
                  
                  <!-- Filtros -->
                  <div class="row mt-4">
                    <div class="col-md-3">
                      <select class="form-select" v-model="filtroStatus" @change="aplicarFiltros">
                        <option value="">Todos os Status</option>
                        <option value="A">Ativo</option>
                        <option value="I">Inativo</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <select class="form-select" v-model="filtroTipo" @change="aplicarFiltros">
                        <option value="">Todos os Tipos</option>
                        <option value="Material">Material</option>
                        <option value="Medicamento">Medicamento</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <select class="form-select" v-model="filtroEstoque" @change="aplicarFiltros">
                        <option value="">Controle de Estoque</option>
                        <option value="true">Com Controle</option>
                        <option value="false">Sem Controle</option>
                      </select>
                    </div>
                  </div>

                  <!-- Grid de Unidades -->
                  <div class="row g-3 mt-3" v-if="unidadesFiltradas && unidadesFiltradas.length > 0">
                    <div
                      v-for="unidade in unidadesFiltradas"
                      :key="unidade.id"
                      class="col-12 col-sm-6 col-md-4 col-lg-3"
                    >
                      <div
                        class="card unidade-card position-relative"
                        @click="$router.push(`/unidade/${unidade.id}?tab=overview`)"
                      >
                        <!-- Menu de ações -->
                        <div class="position-absolute top-0 end-0 p-2">
                          <div class="dropdown">
                            <button
                              class="btn btn-link btn-sm text-muted"
                              type="button"
                              data-bs-toggle="dropdown"
                              @click.stop
                            >
                              <i class="mdi mdi-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu">
                              <li>
                                <a
                                  class="dropdown-item"
                                  href="#"
                                  @click.prevent.stop="editarUnidade(unidade)"
                                >
                                  <i class="mdi mdi-pencil me-2"></i>Editar
                                </a>
                              </li>
                              <li>
                                <a
                                  class="dropdown-item text-danger"
                                  href="#"
                                  @click.prevent.stop="confirmarExclusao(unidade)"
                                >
                                  <i class="mdi mdi-delete me-2"></i>Excluir
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                          <!-- Código -->
                          <div class="mb-2">
                            <small class="text-muted">{{ unidade.codigo_unidade }}</small>
                          </div>

                          <!-- Nome -->
                          <h5 class="card-title mb-3">{{ unidade.nome }}</h5>

                          <!-- Infos -->
                          <div class="d-flex flex-column gap-2">
                            <!-- Status -->
                            <span
                              class="badge"
                              :class="unidade.status === 'A' ? 'bg-success' : 'bg-secondary'"
                            >
                              {{ unidade.status === 'A' ? 'Ativo' : 'Inativo' }}
                            </span>

                            <!-- Tipo -->
                            <span
                              class="badge"
                              :class="unidade.tipo === 'Medicamento' ? 'bg-info' : 'bg-primary'"
                            >
                              {{ unidade.tipo }}
                            </span>

                            <!-- Controle de estoque -->
                            <span
                              class="badge"
                              :class="unidade.estoque ? 'bg-warning' : 'bg-light text-dark'"
                            >
                              {{ unidade.estoque ? 'Controla Estoque' : 'Sem Controle' }}
                            </span>
                          </div>

                          <!-- Descrição -->
                          <div class="mt-2" v-if="unidade.descricao">
                            <small class="text-muted">{{ unidade.descricao }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Mensagem quando não há unidades -->
                  <div v-else-if="!loading" class="text-center mt-5">
                    <div class="d-flex flex-column align-items-center">
                      <i class="mdi mdi-office-building-outline display-4 text-muted mb-3"></i>
                      <h5>Nenhuma unidade encontrada</h5>
                      <p class="text-muted">Crie sua primeira unidade clicando no botão "Nova Unidade"</p>
                    </div>
                  </div>

                  <!-- Loading -->
                  <div v-if="loading" class="text-center mt-5">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Carregando...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ModalUnidades
              idModal="addUPUnidade"
              :functions="functions"
            ></ModalUnidades>
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

import functions from "../../functions/cad_unidades.js";

export default {
  name: "UnidadesView",
  components: {
    LinkModal01,
    TemplateAdmin,
    ModalUnidades,
  },
  data() {
    return {
      functions: functions,
      titleModal: "Cadastro de Unidades",
      varsModalData: {
        status: "A",
        nome: "",
        codigo_unidade: "",
        descricao: "",
        estoque: false,
        tipo: "Material"
      },
      loading: false,
      filtroStatus: "",
      filtroTipo: "",
      filtroEstoque: "",
      unidades: []
    };
  },
  computed: {
    unidadesFiltradas() {
      if (!this.unidades) return [];
      
      return this.unidades.filter((unidade) => {
        const statusMatch = !this.filtroStatus || unidade.status === this.filtroStatus;
        const tipoMatch = !this.filtroTipo || unidade.tipo === this.filtroTipo;
        const estoqueMatch = !this.filtroEstoque || 
          (this.filtroEstoque === 'true') === unidade.estoque;
        
        return statusMatch && tipoMatch && estoqueMatch;
      });
    }
  },
  methods: {
    carregarUnidades() {
      console.log('=== carregarUnidades iniciado ===');
      this.loading = true;
      
      this.$axios
        .post('/unidades/list', {
          filters: [] // Sem filtros, pegar todas
        }, {
          headers: {
            Authorization: "Bearer " + this.$store.getters.getUserToken
          }
        })
        .then(response => {
          console.log('Response recebido:', response.data);
          
          if (response.data.status && response.data.data) {
            this.unidades = response.data.data;
            console.log('Unidades carregadas:', this.unidades);
          } else {
            console.error('Resposta da API sem dados válidos:', response.data);
            this.unidades = [];
          }
        })
        .catch(error => {
          console.error('Erro na chamada da API:', error);
          console.error('Response error:', error.response);
          this.unidades = [];
          this.showNotification('Erro ao carregar unidades', 'error');
        })
        .finally(() => {
          this.loading = false;
          console.log('=== carregarUnidades finalizado ===');
        });
    },
    
    showNotification(message, type = 'success') {
      if (this.$toastr) {
        if (type === 'success') {
          this.$toastr.success(message);
        } else {
          this.$toastr.error(message);
        }
      } else {
        alert(message);
      }
    },
    
    aplicarFiltros() {
      // Os filtros são aplicados automaticamente via computed property
    },
    
    editarUnidade(unidade) {
      this.$store.commit('SET_MODAL_DATA', {
        modalTitle: 'Editar Unidade',
        modalData: { ...unidade },
        modalFunction: 'UP'
      });
      
      // Abrir modal
      const modal = new bootstrap.Modal(document.getElementById('addUPUnidade'));
      modal.show();
    },
    
    async confirmarExclusao(unidade) {
      if (confirm(`Tem certeza que deseja excluir a unidade "${unidade.nome}"?`)) {
        try {
          const result = await functions.excluirUnidade(unidade.id);
          if (result.success) {
            this.$toastr.success('Unidade excluída com sucesso!');
            this.carregarUnidades(); // Recarregar lista
          } else {
            this.$toastr.error(result.message || 'Erro ao excluir unidade');
          }
        } catch (error) {
          console.error('Erro ao excluir unidade:', error);
          this.$toastr.error('Erro ao excluir unidade');
        }
      }
    }
  },
  created() {
    // Sobrescrever a função listAll para recarregar nossa lista personalizada
    this.functions.listAll = (content) => {
      console.log('=== listAll chamado para recarregar unidades ===');
      console.log('content:', content);
      this.carregarUnidades();
    };
  },
  mounted() {
    this.carregarUnidades();
  }
};
</script>

<style scoped>
.unidade-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unidade-card:hover {
  transform: scale(1.03);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.badge {
  font-size: 0.75rem;
}

.dropdown-toggle::after {
  display: none;
}
</style>
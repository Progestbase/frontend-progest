<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <!-- Loading -->
              <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Carregando...</span>
                </div>
              </div>

              <!-- Conteúdo -->
              <div v-else-if="setor.id" class="card">
                <div class="card-body">
                  <!-- Tabs Navigation -->
                  <ul
                    class="nav nav-tabs nav-tabs-custom nav-justified"
                    role="tablist"
                  >
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'overview' }"
                        @click="changeTab('overview')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="fas fa-info-circle"></i
                        ></span>
                        <span class="d-none d-sm-block">Overview</span>
                      </a>
                    </li>
                    <li class="nav-item" v-if="setor.estoque">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'estoque' }"
                        @click="changeTab('estoque')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="fas fa-boxes"></i
                        ></span>
                        <span class="d-none d-sm-block">Estoque</span>
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'movimentacoes' }"
                        @click="changeTab('movimentacoes')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="mdi mdi-swap-horizontal"></i
                        ></span>
                        <span class="d-none d-sm-block">Movimentações</span>
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'entrada' }"
                        @click="changeTab('entrada')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="mdi mdi-tray-arrow-down"></i
                        ></span>
                        <span class="d-none d-sm-block">Entrada</span>
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        class="nav-link"
                        :class="{ active: activeTab === 'usuarios' }"
                        @click="changeTab('usuarios')"
                        href="#"
                      >
                        <span class="d-block d-sm-none"
                          ><i class="mdi mdi-account-multiple"></i
                        ></span>
                        <span class="d-none d-sm-block">Usuários</span>
                      </a>
                    </li>
                  </ul>

                  <!-- Tab Content -->
                  <div class="tab-content p-3 text-muted">
                    <!-- Overview Tab -->
                    <div v-show="activeTab === 'overview'">
                      <div class="row">
                        <div class="col-md-8">
                          <div class="card border">
                            <div class="card-header">
                              <h5 class="card-title mb-0">
                                <i class="mdi mdi-information-outline me-2"></i>
                                Informações do Setor
                              </h5>
                            </div>
                            <div class="card-body">
                              <div class="row">
                                <div class="col-md-6">
                                  <div class="mb-3">
                                    <label class="form-label">Nome:</label>
                                    <p class="form-control-plaintext">
                                      {{ setor.nome }}
                                    </p>
                                  </div>
                                </div>
                                <div class="col-md-6">
                                  <div class="mb-3">
                                    <label class="form-label">Tipo:</label>
                                    <span
                                      class="badge"
                                      :class="
                                        setor.tipo === 'Medicamento'
                                          ? 'bg-info'
                                          : 'bg-primary'
                                      "
                                    >
                                      {{ setor.tipo }}
                                    </span>
                                  </div>
                                </div>
                                <div class="col-md-6">
                                  <div class="mb-3">
                                    <label class="form-label">Status:</label>
                                    <span
                                      class="badge"
                                      :class="
                                        setor.status === 'A'
                                          ? 'bg-success'
                                          : 'bg-secondary'
                                      "
                                    >
                                      {{
                                        setor.status === "A"
                                          ? "Ativo"
                                          : "Inativo"
                                      }}
                                    </span>
                                  </div>
                                </div>
                                <div class="col-md-6">
                                  <div class="mb-3">
                                    <label class="form-label"
                                      >Controla Estoque:</label
                                    >
                                    <span
                                      class="badge"
                                      :class="
                                        setor.estoque
                                          ? 'bg-warning'
                                          : 'bg-light text-dark'
                                      "
                                    >
                                      {{ setor.estoque ? "Sim" : "Não" }}
                                    </span>
                                  </div>
                                </div>
                                <div class="col-12" v-if="setor.descricao">
                                  <div class="mb-3">
                                    <label class="form-label">Descrição:</label>
                                    <p class="form-control-plaintext">
                                      {{ setor.descricao }}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="card border">
                            <div class="card-header">
                              <h5 class="card-title mb-0">
                                <i class="mdi mdi-cog-outline me-2"></i>
                                Ações
                              </h5>
                            </div>
                            <div class="card-body">
                              <div class="d-grid gap-2">
                                <button
                                  class="btn btn-primary"
                                  @click="editarSetor"
                                >
                                  <i class="mdi mdi-pencil me-2"></i>
                                  Editar Setor
                                </button>
                                <button
                                  class="btn btn-danger"
                                  @click="confirmarExclusao"
                                >
                                  <i class="mdi mdi-delete me-2"></i>
                                  Excluir Setor
                                </button>
                              </div>
                            </div>
                          </div>

                          <!-- Informações adicionais -->
                          <!-- Fornecedores relacionados (novo card) -->
                          <div
                            v-if="
                              setor.fornecedores_relacionados &&
                              setor.fornecedores_relacionados.length > 0
                            "
                            class="card border mt-3"
                          >
                            <div class="card-header">
                              <h5 class="card-title mb-0">
                                <i
                                  class="mdi mdi-truck-delivery-outline me-2"
                                ></i>
                                Fornecedores Relacionados
                              </h5>
                            </div>
                            <div class="card-body">
                              <div
                                v-for="rel of setor.fornecedores_relacionados"
                                :key="rel.id"
                                class="mb-3 border rounded p-2"
                              >
                                <div
                                  class="d-flex justify-content-between align-items-start"
                                >
                                  <div>
                                    <div class="fw-bold">
                                      {{
                                        rel.fornecedor?.nome ||
                                        rel.fornecedor?.razao_social_nome ||
                                        rel.fornecedor?.razao_social ||
                                        "Fornecedor desconhecido"
                                      }}
                                    </div>
                                    <div class="text-muted small">
                                      {{ rel.fornecedor?.descricao || "" }}
                                    </div>
                                  </div>
                                  <div class="text-end">
                                    <span
                                      class="badge"
                                      :class="
                                        rel.tipo_produto === 'Medicamento'
                                          ? 'bg-info'
                                          : 'bg-primary'
                                      "
                                    >
                                      {{
                                        rel.tipo_produto ||
                                        rel.fornecedor?.tipo ||
                                        "-"
                                      }}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="card border mt-3">
                            <div class="card-header">
                              <h5 class="card-title mb-0">
                                <i class="mdi mdi-calendar-outline me-2"></i>
                                Datas
                              </h5>
                            </div>
                            <div class="card-body">
                              <div class="mb-2">
                                <small class="text-muted">Criado em:</small>
                                <p class="mb-1">
                                  {{ formatarData(setor.created_at) }}
                                </p>
                              </div>
                              <div class="mb-0">
                                <small class="text-muted">Atualizado em:</small>
                                <p class="mb-0">
                                  {{ formatarData(setor.updated_at) }}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Estoque Tab -->
                    <div v-show="activeTab === 'estoque'">
                      <EstoqueSetor
                        v-if="setor.id"
                        :setorId="setor.id"
                        :key="setor.id"
                      />
                    </div>

                    <!-- Movimentações Tab -->
                    <div v-show="activeTab === 'movimentacoes'">
                      <div
                        class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3"
                      >
                        <div>
                          <h5 class="mb-1">
                            <i class="mdi mdi-swap-horizontal me-2"></i>
                            Movimentações
                          </h5>
                          <p class="text-muted mb-0">
                            Solicitações, saídas e devoluções relacionadas a
                            esta unidade.
                          </p>
                        </div>
                        <div class="d-flex gap-2">
                          <button
                            class="btn btn-outline-primary"
                            title="Fazer requisição"
                            @click.prevent="abrirSolicitacao"
                          >
                            <i class="mdi mdi-file-plus me-2"></i>
                            Fazer requisição
                          </button>
                          <button
                            class="btn btn-outline-danger"
                            title="Registrar saída"
                            @click.prevent
                          >
                            <i class="mdi mdi-truck-delivery me-2"></i>
                            Registrar saída
                          </button>
                          <button
                            class="btn btn-outline-secondary"
                            title="Devolução"
                            @click.prevent
                          >
                            <i class="mdi mdi-archive-arrow-up me-2"></i>
                            Devolução
                          </button>
                        </div>
                      </div>

                      <div
                        v-if="listMovimentacoes.length > 0"
                        class="table-responsive"
                      >
                        <table class="table table-striped align-middle mb-0">
                          <thead>
                            <tr>
                              <th class="text-start">ID</th>
                              <th class="text-start">Criada em</th>
                              <th class="text-start">Tipo</th>
                              <th class="text-start">Status</th>
                              <th class="text-center">Itens</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="mov in listMovimentacoes"
                              :key="mov.id"
                              style="cursor: pointer"
                              class="hover-row"
                            >
                              <td class="text-start">{{ mov.id }}</td>
                              <td class="text-start">
                                {{ formatarData(mov.created_at) }}
                              </td>
                              <td class="text-start">
                                {{ formatarTipo(mov.tipo) }}
                              </td>
                              <td class="text-start">
                                {{ traduzStatus(mov.status_solicitacao) }}
                              </td>
                              <td class="text-center">
                                {{ mov.itens?.length || 0 }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div v-else class="text-center py-5">
                        <div class="d-flex flex-column align-items-center">
                          <i
                            class="mdi mdi-swap-horizontal display-4 text-muted mb-3"
                          ></i>
                          <h5>Nenhuma movimentação registrada</h5>
                          <p class="text-muted mb-0">
                            Ainda não há movimentações para esta unidade.
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Entrada Tab -->
                    <div v-show="activeTab === 'entrada'">
                      <div
                        class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3"
                      >
                        <div>
                          <h5 class="mb-1">
                            <i class="mdi mdi-tray-arrow-down me-2"></i>
                            Entradas de Estoque
                          </h5>
                          <p class="text-muted mb-0">
                            Registros de entradas já lançadas para este setor.
                          </p>
                        </div>
                        <button
                          class="btn btn-success"
                          @click="abrirModalEntrada"
                          :disabled="!setor.id"
                        >
                          <i class="mdi mdi-plus me-2"></i>
                          Registrar Entrada
                        </button>
                      </div>

                      <div
                        v-if="listEntradas.length > 0"
                        class="table-responsive"
                      >
                        <table class="table table-striped align-middle mb-0">
                          <thead>
                            <tr>
                              <th class="text-start">ID</th>
                              <th class="text-start">Lançada em</th>
                              <th class="text-start">Nota Fiscal</th>
                              <th class="text-center">Itens diferentes</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="entrada in listEntradas"
                              :key="entrada.id"
                              @click="visualizarEntrada(entrada)"
                              style="cursor: pointer"
                              class="hover-row"
                            >
                              <td class="text-start">{{ entrada.id }}</td>
                              <td class="text-start">
                                {{ formatarData(entrada.created_at) }}
                              </td>
                              <td class="text-start">
                                {{ entrada.nota_fiscal }}
                              </td>
                              <td class="text-center">
                                {{ entrada.itens?.length || 0 }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div v-else class="text-center py-5">
                        <div class="d-flex flex-column align-items-center">
                          <i
                            class="mdi mdi-tray-arrow-down-outline display-4 text-muted mb-3"
                          ></i>
                          <h5>Nenhuma entrada registrada</h5>
                          <p class="text-muted mb-0">
                            Ainda não há registros de entrada para esta unidade.
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Usuários Tab -->
                    <div v-show="activeTab === 'usuarios'">
                      <div
                        class="d-flex justify-content-between align-items-center mb-3"
                      >
                        <div>
                          <h5 class="mb-1">
                            <i class="mdi mdi-account-multiple me-2"></i
                            >Usuários do Setor
                          </h5>
                          <p class="text-muted mb-0">
                            Lista de usuários vinculados a este setor (pivot
                            usuario_setor).
                          </p>
                        </div>
                        <div>
                          <button
                            class="btn btn-success"
                            @click.prevent="abrirModalAdicionarUsuario"
                            :disabled="!setor.id"
                          >
                            <i class="mdi mdi-plus me-2"></i>Adicionar usuário
                          </button>
                        </div>
                      </div>

                      <div
                        v-if="listUsuariosSetor.length > 0"
                        class="table-responsive"
                      >
                        <table class="table table-striped align-middle mb-0">
                          <thead>
                            <tr>
                              <th class="text-start">#</th>
                              <th class="text-start">Nome</th>
                              <th class="text-start">E-mail</th>
                              <th class="text-center">Perfil</th>
                              <th class="text-center">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="u in listUsuariosSetor" :key="u.id">
                              <td class="text-start">{{ u.id }}</td>
                              <td class="text-start">{{ u.name }}</td>
                              <td class="text-start">{{ u.email }}</td>
                              <td class="text-center">
                                {{
                                  u.perfil || (u.pivot && u.pivot.perfil) || "-"
                                }}
                              </td>
                              <td class="text-center">
                                <button
                                  class="btn btn-sm btn-primary me-2"
                                  @click.prevent="abrirModalEditarUsuario(u)"
                                >
                                  Editar
                                </button>
                                <button
                                  class="btn btn-sm btn-danger"
                                  @click.prevent="confirmarRemoverUsuario(u)"
                                >
                                  Remover
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div v-else class="text-center py-5">
                        <div class="d-flex flex-column align-items-center">
                          <i
                            class="mdi mdi-account-multiple display-4 text-muted mb-3"
                          ></i>
                          <h5>Nenhum usuário vinculado</h5>
                          <p class="text-muted mb-0">
                            Clique em "Adicionar usuário" para criar o vínculo.
                          </p>
                        </div>
                      </div>

                      <!-- Modal gerenciar vínculo usuário-setor -->
                      <ModalUsuarioSetor
                        idModal="modalUsuarioSetor"
                        :setorId="setor.id"
                        :mode="modalMode"
                        :initialData="modalInitialData"
                        @changed="loadUsuariosSetor"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Erro -->
              <div v-else class="text-center py-5">
                <i
                  class="mdi mdi-alert-circle-outline display-4 text-danger mb-3"
                ></i>
                <h5>Setor n</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Entrada de Estoque -->
    <ModalEntradaEstoque idModal="modalEntradaEstoque" :unidade="setor" />

    <!-- Modal de Visualização de Entrada -->
    <ModalVisualizarEntrada
      idModal="modalVisualizarEntrada"
      :entrada="entradaSelecionada"
    />
    <!-- Modal de Solicitação de Movimentação -->
    <ModalSolicitacaoMovimentacao
      ref="modalSolicitacaoMovimentacao"
      idModal="modalSolicitacaoMovimentacao"
      :unidade-atual="setor"
      :fornecedores-relacionados="setor.fornecedores_relacionados || []"
      :produtos="produtosDisponiveis"
    />
    <!-- Modal de Edição/Cadastro de Setor (instância local para este view) -->
    <ModalSetor idModal="addUPSetor" :functions="functions" />
  </TemplateAdmin>
</template>

<script>
import TemplateAdmin from "@/views/roleAdmin/TemplateAdmin.vue";
import EstoqueSetor from "./EstoqueSetor.vue";
import ModalEntradaEstoque from "@/components/cadastros/ModalEntradaEstoque.vue";
import ModalVisualizarEntrada from "@/components/cadastros/ModalVisualizarEntrada.vue";
import ModalSetor from "@/components/cadastros/ModalSetor.vue";
import ModalSolicitacaoMovimentacao from "@/components/cadastros/ModalSolicitacaoMovimentacao.vue";
import functions from "@/functions/cad_setores.js";
import functionsMovimentacao from "@/functions/cad_movimentacao.js";
import * as bootstrap from "bootstrap";
import functionsEntradas from "@/functions/cad_entradas.js";
import ModalUsuarioSetor from "@/components/cadastros/ModalUsuarioSetor.vue";
import usuarioSetorFunctions from "@/functions/cad_usuario_setor.js";

export default {
  name: "SetorDetalhesView",
  components: {
    TemplateAdmin,
    EstoqueSetor,
    ModalEntradaEstoque,
    ModalVisualizarEntrada,
    ModalSetor,
    ModalSolicitacaoMovimentacao,
    ModalUsuarioSetor,
  },
  data() {
    return {
      setor: {},
      loading: true,
      error: null,
      activeTab: "overview",
      entradaSelecionada: null,
      functions: functions,
      // lista local de usuários vinculados a este setor
      listUsuariosSetor: [],
      modalMode: "ADD",
      modalInitialData: {},
      usuarioSetorFunctions: usuarioSetorFunctions,
    };
  },
  computed: {
    setorNomeAtual() {
      return this.setor?.nome || "Carregando...";
    },
    listEntradas() {
      const entradas = this.$store.getters.getListEntradas;
      console.log("listEntradas computed:", entradas);
      return entradas;
    },
    listMovimentacoes() {
      return this.$store.getters.getListMovimentacoes || [];
    },
    unidades() {
      return this.$store.getters.getListSetores || [];
    },
    produtosDisponiveis() {
      return this.$store.getters.getListProdutos || [];
    },
  },
  mounted() {
    this.initTabFromRoute();
    // Observar mudanças na query 'tab' (back/forward do browser)
    this.$watch(
      () => this.$route.query.tab,
      (newTab) => {
        const tab = this.normalizeTab(newTab);
        this.activeTab = tab;
      }
    );

    this.carregarSetor();
  },
  methods: {
    async carregarSetor() {
      try {
        this.loading = true;
        const setorId = this.$route.params.id;
        console.log("carregarSetor: solicitando setor id=", setorId);
        const response = await this.$axios.post(
          `/setores/listData`,
          {
            id: setorId,
          },
          {
            headers: {
              Authorization: "Bearer " + this.$store.getters.getUserToken,
            },
          }
        );
        this.setor = response.data.data;
        // DEBUG: inspeciona o payload retornado do backend para este setor
        console.log("carregarSetor response.data:", response.data);
        console.log("carregarSetor setor (data):", this.setor);
        // se existir fornecedores relacionados no payload, logar especificamente
        if (this.setor.fornecedores_relacionados) {
          console.log(
            "fornecedores_relacionados:",
            this.setor.fornecedores_relacionados
          );
        }
        if (this.setor.fornecedores) {
          console.log("fornecedores:", this.setor.fornecedores);
        }
        this.$store.commit("setSetorAtual", this.setor);

        // Carregar entradas do setor
        await this.carregarEntradas();
      } catch (error) {
        // Log detalhado para ajudar diagnóstico (inclui response.data quando disponível)
        console.error("Erro ao carregar setor:", error);
        if (error && error.response) {
          console.error("Erro response status:", error.response.status);
          try {
            console.error("Erro response data:", error.response.data);
          } catch (e) {}
          // Detecção específica de problema conhecido: backend ainda referenciando relação 'polo'
          const respData = error.response.data || {};
          const serverMsg = respData.message || "";
          const serverException = respData.exception || "";
          if (
            typeof serverException === "string" &&
            serverException.includes("RelationNotFoundException") &&
            typeof serverMsg === "string" &&
            serverMsg.toLowerCase().includes("polo")
          ) {
            this.error =
              "Incompatibilidade no backend: relação 'polo' não encontrada. Atualize o backend para expor 'unidade' ou adicione um alias 'polo' (compatibilidade).";
          } else {
            this.error = `Erro ao carregar dados do setor (status ${error.response.status})`;
          }
        } else {
          this.error = "Erro ao carregar dados do setor";
        }
      } finally {
        this.loading = false;
      }
    },
    abrirModalEntrada() {
      // Abrir modal de entrada de estoque
      const modal = new bootstrap.Modal(
        document.getElementById("modalEntradaEstoque")
      );
      modal.show();
    },
    async carregarEntradas() {
      if (this.setor?.id) {
        await functionsEntradas.listByUnidade(this, this.setor.id);
        // Carregar também movimentações da unidade
        await functionsMovimentacao.listBySetor(this, this.setor.id);
      }
    },
    abrirSolicitacao() {
      // prefer to call the child component's abrirModal if available
      const comp = this.$refs.modalSolicitacaoMovimentacao;
      if (comp && typeof comp.abrirModal === "function") {
        // before opening, set default origin based on fornecedores_relacionados in setor
        if (this.setor && this.setor.fornecedores_relacionados) {
          // pass current fornecedor relationships to the modal via a public prop or method
          try {
            comp.setFornecedoresRelacionados(
              this.setor.fornecedores_relacionados || [],
              this.setor
            );
          } catch (e) {
            /* ignore */
          }
        }
        comp.abrirModal();
        return;
      }

      const modalEl = document.getElementById("modalSolicitacaoMovimentacao");
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    },
    formatarTipo(tipo) {
      switch (tipo) {
        case "T":
          return "Transferência";
        case "D":
          return "Devolução";
        case "S":
          return "Saída";
        default:
          return tipo || "-";
      }
    },
    traduzStatus(status) {
      switch (status) {
        case "A":
          return "Aprovado";
        case "R":
          return "Reprovado";
        case "P":
          return "Pendente";
        case "C":
          return "Rascunho";
        default:
          return status || "-";
      }
    },
    visualizarEntrada(entrada) {
      console.log("Visualizar entrada:", entrada);
      this.entradaSelecionada = entrada;
      // Abrir modal de visualização
      const modal = new bootstrap.Modal(
        document.getElementById("modalVisualizarEntrada")
      );
      modal.show();
    },
    formatarData(data) {
      if (!data) return null;

      // Se o backend retornar um timestamp com 'T', pegar apenas a parte da data
      let dataStr = String(data);
      if (dataStr.includes("T")) {
        dataStr = dataStr.split("T")[0];
      }

      const parts = dataStr.split("-");
      if (parts.length < 3) return null;
      const [ano, mes, dia] = parts;
      // Retornar no formato dd/mm/yyyy
      return `${dia}/${mes}/${ano}`;
    },
    changeTab(tab) {
      const normalized = this.normalizeTab(tab);
      this.activeTab = normalized;

      // Quando trocar para a aba de usuários, carregar os vínculos
      if (this.activeTab === "usuarios" && this.setor && this.setor.id) {
        this.loadUsuariosSetor();
      }

      // Atualizar URL mantendo outros query params
      try {
        const newQuery = Object.assign({}, this.$route.query || {});
        newQuery.tab = normalized;
        // usar replace para não poluir histórico quando a mudança for automática
        this.$router
          .push({ path: this.$route.path, query: newQuery })
          .catch(() => {});
      } catch (e) {
        console.warn("Não foi possível atualizar a URL com a tab:", e);
      }
    },
    // Garante valores válidos e fallback para 'overview'
    normalizeTab(tab) {
      const allowed = [
        "overview",
        "estoque",
        "movimentacoes",
        "entrada",
        "usuarios",
      ];
      if (!tab || typeof tab !== "string") return "overview";
      return allowed.includes(tab) ? tab : "overview";
    },
    initTabFromRoute() {
      const queryTab = this.$route.query?.tab;
      this.activeTab = this.normalizeTab(queryTab);
      // garantir que a URL contenha o param (substitui sem adicionar entrada no histórico)
      try {
        const newQuery = Object.assign({}, this.$route.query || {});
        newQuery.tab = this.activeTab;
        this.$router
          .replace({ path: this.$route.path, query: newQuery })
          .catch(() => {});
      } catch (e) {
        /* ignore */
      }
    },
    editarSetor() {
      // Prepara e abre o modal de edição do setor atual
      this.$store.commit("SET_MODAL_DATA", {
        modalTitle: "Editar Setor",
        modalData: { ...this.setor },
        modalFunction: "UP",
      });

      // Mostrar o modal (id usado pelo componente ModalSetor)
      const modalEl = document.getElementById("addUPSetor");
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      } else {
        console.warn("Modal addUPSetor não encontrado no DOM");
      }
    },
    loadUsuariosSetor() {
      if (!this.setor || !this.setor.id) return;
      this.usuarioSetorFunctions
        .listBySetor(this, this.setor.id)
        .then((data) => {
          // data é um array de usuários com campo perfil (ou contendo pivot.perfil)
          this.listUsuariosSetor = (data || []).map((u) => ({
            id: u.id,
            name: u.name || u.nome || "",
            email: u.email || "",
            perfil: u.perfil || (u.pivot && u.pivot.perfil) || "",
          }));
        });
    },
    abrirModalAdicionarUsuario() {
      this.modalMode = "ADD";
      this.modalInitialData = {};
      // abrir o modal bootstrap
      const modalEl = document.getElementById("modalUsuarioSetor");
      if (modalEl) {
        const m = new bootstrap.Modal(modalEl);
        m.show();
      }
    },
    abrirModalEditarUsuario(u) {
      this.modalMode = "UP";
      this.modalInitialData = { usuario_id: u.id, perfil: u.perfil };
      const modalEl = document.getElementById("modalUsuarioSetor");
      if (modalEl) {
        const m = new bootstrap.Modal(modalEl);
        m.show();
      }
    },
    confirmarRemoverUsuario(u) {
      if (
        !confirm(
          "Tem certeza que deseja remover o vínculo deste usuário com o setor?"
        )
      )
        return;
      this.usuarioSetorFunctions
        .remove(this, { usuario_id: u.id, setor_id: this.setor.id })
        .then((resp) => {
          if (resp && resp.status) {
            if (this.$toastr) this.$toastr.s("Vínculo removido com sucesso");
            else alert("Vínculo removido com sucesso");
            this.loadUsuariosSetor();
          } else {
            const msg = resp?.message || "Erro ao remover vínculo";
            if (this.$toastr) this.$toastr.e(msg);
            else alert(msg);
          }
        })
        .catch((err) => {
          const status = err?.response?.status;
          if (status === 403) {
            if (this.$toastr) this.$toastr.e("Permissão negada");
            else alert("Permissão negada");
          } else {
            if (this.$toastr) this.$toastr.e("Erro ao remover vínculo");
            else alert("Erro ao remover vínculo");
          }
        });
    },
  },
};
</script>

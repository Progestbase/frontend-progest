<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">

          <!-- Grid de Unidades -->
          <div class="row g-3 mt-3">
            <div
              v-for="unidade in unidades"
              :key="unidade.id"
              class="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <div
                class="card unidade-card"
                @click="$router.push(`/estoque/${unidade.id}`)"
              >
                <div class="card-body text-center d-flex flex-column align-items-center justify-content-center">
                  <!-- Nome -->
                  <h5 class="card-title mb-3">{{ unidade.nome }}</h5>

                  <!-- Infos -->
                  <div class="d-flex flex-column gap-2">
                    <!-- Se é central -->
                    <span
                      class="badge"
                      :class="unidade.central ? 'bg-primary' : 'bg-secondary'"
                    >
                      {{ unidade.central ? 'Central' : 'Unidade' }}
                    </span>

                    <!-- Status de estoque -->
                    <span
                      class="badge"
                      :class="unidade.itensAbaixoMinimo ? 'bg-danger' : 'bg-success'"
                    >
                      {{ unidade.itensAbaixoMinimo ? 'Itens abaixo do mínimo' : 'Todos normais' }}
                    </span>
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
  name: "Estoque",
  components: { TemplateAdmin },
  data() {
    return {
      unidades: [
        { id: 1, nome: "Unidade A", central: true, itensAbaixoMinimo: false },
        { id: 2, nome: "Unidade B", central: false, itensAbaixoMinimo: true },
        { id: 3, nome: "Unidade C", central: false, itensAbaixoMinimo: false },
        { id: 4, nome: "Unidade D", central: true, itensAbaixoMinimo: true },
      ],
    };
  },
};
</script>

<style scoped>
.unidade-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 160px; /* deixa os cards com altura mínima maior */
  display: flex;
  align-items: center;
  justify-content: center;
}
.unidade-card:hover {
  transform: scale(1.03);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
}
</style>

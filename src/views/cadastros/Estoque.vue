<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">
          <h2 class="mb-4">Estoque - Unidades</h2>

          <!-- Grid de Unidades -->
          <div class="row g-3">
            <div
              v-for="unidade in unidades"
              :key="unidade.id"
              class="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <div
                class="card unidade-card"
                @click="$router.push(`/estoque/${unidade.id}`)"
              >
                <div class="card-body text-center">
                  <h5 class="card-title">{{ unidade.nome }}</h5>
                  <p class="card-text">
                    Estoque atual: {{ unidade.quantidade_atual }}
                  </p>
                  <span
                    class="badge"
                    :class="unidade.quantidade_atual < unidade.quantidade_minima ? 'bg-danger' : 'bg-success'"
                  >
                    {{ unidade.quantidade_atual < unidade.quantidade_minima ? 'Abaixo do mínimo' : 'Normal' }}
                  </span>
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
        { id: 1, nome: "Unidade A", quantidade_atual: 120, quantidade_minima: 50 },
        { id: 2, nome: "Unidade B", quantidade_atual: 20, quantidade_minima: 30 },
        { id: 3, nome: "Unidade C", quantidade_atual: 75, quantidade_minima: 40 },
        { id: 4, nome: "Unidade D", quantidade_atual: 200, quantidade_minima: 80 },
      ],
    };
  },
};
</script>

<style scoped>
.unidade-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.unidade-card:hover {
  transform: scale(1.03);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
}
</style>

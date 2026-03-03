<template>
  <TemplateAdmin>
    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid py-4">
          <h4>Relatórios</h4>
          <p class="text-muted">Escolha um relatório para visualizar dados e exportar.</p>

          <div class="list-group mt-4">
            <router-link class="list-group-item list-group-item-action" to="/relatorios/entradas">
              <strong>Entradas</strong>
              <div class="small text-muted">Relatório geral de entradas de estoque (visão global)</div>
            </router-link>

            <router-link class="list-group-item list-group-item-action" to="/relatorios/movimentacoes">
              <strong>Movimentações</strong>
              <div class="small text-muted">Relatório de transferências, saídas e devoluções</div>
            </router-link>

            <router-link class="list-group-item list-group-item-action" to="/relatorios/saidas">
              <strong>Saídas</strong>
              <div class="small text-muted">Relatório de saídas de estoque (visão geral)</div>
            </router-link>

            <router-link class="list-group-item list-group-item-action" to="/relatorios/saidas-por-data">
              <strong>Saídas por Data</strong>
              <div class="small text-muted">Relatório de saídas agrupadas por data de movimentação</div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </TemplateAdmin>
</template>

<script>
import TemplateAdmin from '@/views/roleAdmin/TemplateAdmin.vue'

export default {
  name: 'RelatoriosIndex',
  components: { TemplateAdmin }
}
</script>

<style scoped>
/* estilos mínimos */
</style>

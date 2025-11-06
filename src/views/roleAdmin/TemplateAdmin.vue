<template>
  <div class="admin-layout">
    <Sidebar class="sidebar" />
    <main class="content">
      <Header class="mb-3" />
      <slot />
    </main>
  </div>
</template>

<script setup>
import Sidebar from "@/components/roleAdmin/Sidebar.vue";
import Header from "@/components/roleAdmin/Header.vue";
</script>

<style lang="scss">
.admin-layout {
  display: flex;
  height: 100vh;

  .content {
    flex: 1;
    /* Faz o conteúdo ocupar o restante do espaço */
    overflow-y: auto;
    background-color: var(--light);
  }
}

:root {
  --primary: #bbbfff;
  --grey: #64748b;
  --dark: rgba(0, 77, 153, 1);
  --dark-alt: #002c6b;
  --light: #f1f5f9;
  --sidebar-width: 300px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--light);
}

button {
  cursor: pointer;
  appearance: none;
  border: none;
  outline: none;
  background: none;
}

.app {
  display: flex;

  main {
    flex: 1 1 0;
    padding: 2rem;

    @media (max-width: 768px) {
      padding-left: 6rem;

      .content {
        flex: 1;
        /* Faz o conteúdo ocupar o restante do espaço */
        overflow-x: auto;
        background-color: var(--light);
      }
    }
  }
}
</style>

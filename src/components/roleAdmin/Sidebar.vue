<template>
  <aside :class="`${is_expanded ? 'is-expanded' : ''}`">
    <div class="logo">
      <img
        :src="
          is_expanded
            ? '/src/assets/logo-horizontal.png'
            : '/src/assets/logo-icon.png'
        "
        alt="Logo"
      />
    </div>

    <div class="menu-toggle-wrap">
      <button
        class="menu-toggle"
        @click="ToggleMenu"
        title="Expandir/Recolher Menu"
      >
        <span class="material-icons">keyboard_double_arrow_right</span>
      </button>
    </div>

    <!-- Menu principal -->
    <div class="menu">
      <router-link class="button" to="/dashboard" title="Tela Inicial">
        <span class="material-icons">home</span>
        <span class="text">Tela Inicial</span>
      </router-link>
    </div>

    <h3>Menu</h3>
    <div class="menu">
      <!-- Unidades -->
      <router-link class="button" to="/unidades" title="Unidades">
        <span class="material-icons">apartment</span>
        <span class="text">Unidades</span>
      </router-link>

      <!-- Usuários -->
      <router-link class="button" to="/users" title="Usuários">
        <span class="material-icons">group</span>
        <span class="text">Usuários</span>
      </router-link>

      <!-- Produtos -->
      <router-link class="button" to="/produtos" title="Produtos">
        <span class="material-icons">inventory</span>
        <span class="text">Produtos</span>
      </router-link>

      <!-- Fornecedores -->
      <router-link class="button" to="/fornecedores" title="Fornecedores">
        <span class="material-icons">business_center</span>
        <span class="text">Fornecedores</span>
      </router-link>

      <!-- Submenu Cadastros -->
      <div class="submenu">
        <button class="button" @click="toggleSubmenu" title="Mais Cadastros">
          <span class="material-icons">settings</span>
          <span class="text">Cadastros</span>
          <span
            class="material-icons expand-icon"
            :class="{ open: submenuOpen }"
            >expand_more</span
          >
        </button>

        <!-- transition para suavizar -->
        <transition name="submenu">
          <div v-show="submenuOpen" class="submenu-items">
            <router-link
              class="button"
              to="/grupoProduto"
              title="Grupos de Produtos"
            >
              <span class="material-icons">label</span>
              <span class="text">Grupos de Produtos</span>
            </router-link>

            <router-link
              class="button"
              to="/unidadesMedida"
              title="Unidades de Medida"
            >
              <span class="material-icons">straighten</span>
              <span class="text">Unidades de Medida</span>
            </router-link>
          </div>
        </transition>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const is_expanded = ref(true);
const submenuOpen = ref(false);

const ToggleMenu = () => {
  is_expanded.value = !is_expanded.value;
};

const toggleSubmenu = () => {
  submenuOpen.value = !submenuOpen.value;
};

// 🔹 Carregar valor salvo ao montar
onMounted(() => {
  const saved = localStorage.getItem("submenuOpen");
  submenuOpen.value = saved === "true";
});

// 🔹 Salvar sempre que mudar
watch(submenuOpen, (val) => {
  localStorage.setItem("submenuOpen", val);
});
</script>

<style lang="scss" scoped>
aside {
  display: flex;
  flex-direction: column;
  width: calc(2.8rem + 60px);
  min-height: 100vh;
  overflow: hidden;
  overflow-y: auto;
  padding: 1rem;

  background-color: var(--dark);
  color: var(--light);

  transition: width 0.2s ease-out;

  .logo {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;

    img {
      max-width: 120px; // quando expandido
      transition: max-width 0.2s ease;
    }
  }

  &:not(.is-expanded) {
    .logo img {
      max-width: 40px; // 👈 diminui a logo
    }
  }

  &.is-expanded {
    width: var(--sidebar-width);

    h3,
    .button .text {
      opacity: 1;
    }

    .logo img {
      max-width: 120px; // volta ao tamanho normal
    }
  }

  .menu-toggle-wrap {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
    position: relative;

    .menu-toggle {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;

      .material-icons {
        font-size: 1.5rem;
        color: var(--light);
        transition: transform 0.2s ease, color 0.2s ease;
      }

      &:hover .material-icons {
        color: var(--primary);
        transform: translateX(0.3rem);
      }
    }
  }

  h3 {
    color: var(--grey);
    font-size: 0.85rem;
    text-transform: uppercase;
    margin: 1rem 0 0.5rem 1rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .menu {
    display: flex;
    flex-direction: column;

    .button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 2.8rem;
      padding: 0 1rem;
      text-decoration: none;
      gap: 0.8rem;

      transition: background 0.2s ease, color 0.2s ease;

      .material-icons {
        font-size: 1.4rem;
        min-width: 1.5rem;
        text-align: center;
        color: var(--light);
        transition: color 0.2s ease;
      }

      .text {
        color: var(--light);
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
        flex-grow: 1;
        text-align: left;
      }

      &:hover,
      &.router-link-exact-active {
        background-color: var(--dark-alt);

        .material-icons,
        .text {
          color: var(--primary);
        }
      }

      &.router-link-exact-active {
        border-right: 4px solid var(--primary);
      }
    }
  }

  &.is-expanded {
    width: var(--sidebar-width);

    .menu-toggle {
      transform: rotate(-180deg);
    }

    h3,
    .button .text {
      opacity: 1;
    }

    .button {
      .material-icons {
        margin-right: 0.5rem;
      }

      &::after {
        display: none !important;
      }
    }
  }

  @media (max-width: 768px) {
    position: fixed;
    z-index: 99;
  }
}

.submenu {
  display: flex;
  flex-direction: column;

  .submenu-items {
    display: flex;
    flex-direction: column;
    margin-left: 1rem;
  }

  .expand-icon {
    transition: transform 0.2s ease;
  }

  .expand-icon.open {
    transform: rotate(180deg);
  }
}

/* animação do submenu */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}

.submenu-enter-to,
.submenu-leave-from {
  max-height: 200px; /* ajuste dependendo da quantidade de itens */
  opacity: 1;
}
</style>

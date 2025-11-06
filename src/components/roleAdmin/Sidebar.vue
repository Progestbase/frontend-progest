<template>
  <aside
    :class="`sidebar ${is_expanded ? 'is-expanded' : ''}`"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Logo Section -->
    <div class="logo-section">
      <img
        :src="
          is_expanded
            ? '/src/assets/logo-horizontal.png'
            : '/src/assets/logo-icon.png'
        "
        alt="ProGest Logo"
        class="logo-image"
      />
    </div>

    <!-- Menu Principal -->
    <nav class="menu-section">
      <router-link class="menu-item" to="/dashboard" title="Tela Inicial">
        <span class="material-icons menu-icon">home</span>
        <span class="menu-text">Tela Inicial</span>
      </router-link>
    </nav>

    <!-- Divider -->
    <div class="menu-divider"></div>

    <!-- Main Menu -->
    <nav class="menu-section">
      <router-link class="menu-item" to="/setor-atual" title="Setor Atual">
        <span class="material-icons menu-icon">apartment</span>
        <span class="menu-text">Setor Atual</span>
      </router-link>

      <router-link class="menu-item" to="/setores" title="Setores">
        <span class="material-icons menu-icon">apartment</span>
        <span class="menu-text">Setores</span>
      </router-link>

      <router-link class="menu-item" to="/users" title="Usuários">
        <span class="material-icons menu-icon">group</span>
        <span class="menu-text">Usuários</span>
      </router-link>

      <router-link class="menu-item" to="/produtos" title="Produtos">
        <span class="material-icons menu-icon">inventory</span>
        <span class="menu-text">Produtos</span>
      </router-link>

      <router-link class="menu-item" to="/fornecedores" title="Fornecedores">
        <span class="material-icons menu-icon">business_center</span>
        <span class="menu-text">Fornecedores</span>
      </router-link>

      <!-- Submenu: Cadastros -->
      <div class="submenu-section">
        <button
          class="menu-item submenu-toggle"
          @click="toggleSubmenu"
          title="Mais Cadastros"
        >
          <span class="material-icons menu-icon">settings</span>
          <span class="menu-text">Cadastros</span>
          <span
            class="material-icons expand-icon"
            :class="{ open: submenuOpen }"
          >
            expand_more
          </span>
        </button>

        <!-- Submenu Items -->
        <transition name="submenu-transition">
          <div v-show="submenuOpen" class="submenu-items">
            <router-link class="submenu-item" to="/unidades" title="Unidades">
              <span class="material-icons menu-icon">map</span>
              <span class="menu-text">Unidades</span>
            </router-link>

            <router-link
              class="submenu-item"
              to="/grupoProduto"
              title="Grupos de Produtos"
            >
              <span class="material-icons menu-icon">label</span>
              <span class="menu-text">Grupos de Produtos</span>
            </router-link>

            <router-link
              class="submenu-item"
              to="/unidadesMedida"
              title="Unidades de Medida"
            >
              <span class="material-icons menu-icon">straighten</span>
              <span class="menu-text">Unidades de Medida</span>
            </router-link>
          </div>
        </transition>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const is_expanded = ref(false);
const submenuOpen = ref(false);

const emit = defineEmits(["toggle"]);

const handleMouseEnter = () => {
  is_expanded.value = true;
};

const handleMouseLeave = () => {
  is_expanded.value = false;
};

const toggleSubmenu = () => {
  submenuOpen.value = !submenuOpen.value;
};

onMounted(() => {
  const savedSubmenu = localStorage.getItem("submenuOpen");
  submenuOpen.value = savedSubmenu === "true";
});

watch(submenuOpen, (val) => {
  localStorage.setItem("submenuOpen", val);
});
</script>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 80px;
  min-height: 100vh;
  background: linear-gradient(135deg, #004d99 0%, #003d7a 100%);
  color: white;
  overflow: hidden;
  overflow-y: auto;
  padding: 1rem 0;
  transition: width 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

  &.is-expanded {
    width: 280px;
  }

  /* Logo Section */
  .logo-section {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70px;
    padding: 0 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0.5rem;

    .logo-image {
      max-width: 45px;
      height: auto;
      transition: max-width 0.3s ease;
    }
  }

  &.is-expanded {
    .logo-section {
      .logo-image {
        max-width: 140px;
      }
    }
  }

  /* Toggle Section */
  .toggle-section {
    display: none;
  }

  /* Menu Section */
  .menu-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 0.5rem;

    .menu-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.5);
      padding: 0.5rem 1rem;

      opacity: 1;
      transition: opacity 0.3s ease;
      white-space: nowrap;
      text-align: left;
    }
  }

  /* Menu Divider */
  .menu-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0.5rem 1rem;
  }

  /* Menu Items */
  .menu-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.8rem;
    height: 45px;
    padding: 0 1rem;
    border-radius: 8px;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    font-size: 0.95rem;
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: none;

    .menu-icon {
      font-size: 1.3rem;
      min-width: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .menu-text {
      opacity: 0;
      transition: opacity 0.3s ease;
      text-align: left;
      flex: 1;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      transform: translateX(2px);
    }

    &.router-link-active,
    &.router-link-exact-active {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      border-left: 3px solid #bbbfff;
      padding-left: calc(1rem - 3px);
    }
  }

  &.is-expanded {
    .menu-item {
      .menu-text {
        opacity: 1;
      }
    }
  }

  /* Submenu Section */
  .submenu-section {
    display: flex;
    flex-direction: column;
    gap: 0;

    .submenu-toggle {
      position: relative;

      .expand-icon {
        font-size: 1.1rem;
        margin-left: auto;
        transition: transform 0.3s ease;

        &.open {
          transform: rotate(180deg);
        }
      }
    }

    .submenu-items {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.25rem 0;
      margin-left: 1rem;

      .submenu-item {
        @extend .menu-item;
        padding-left: 1.5rem;
        height: 40px;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.95);
        }

        &.router-link-active,
        &.router-link-exact-active {
          background: rgba(255, 255, 255, 0.15);
          border-left-color: #bbbfff;
        }
      }
    }
  }

  /* Animations */
  @media (max-width: 768px) {
    position: fixed;
    z-index: 99;
    height: 100vh;
  }
}

.submenu-transition-enter-active,
.submenu-transition-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.submenu-transition-enter-from,
.submenu-transition-leave-to {
  max-height: 0;
  opacity: 0;
}

.submenu-transition-enter-to,
.submenu-transition-leave-from {
  max-height: 200px;
  opacity: 1;
}

.material-icons {
  font-family: "Material Icons";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
}
</style>

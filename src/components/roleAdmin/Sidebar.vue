<template>
  <aside
    :class="`sidebar ${is_expanded ? 'is-expanded' : ''}`"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Logo Section -->
    <div class="logo-section">
      <img
        :src="currentLogoSrc"
        :alt="is_expanded ? unidadeNome : 'ProGest Logo'"
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
      <!-- When user is a solicitante in the current sector show only the solicitante pages -->
      <template v-if="isSolicitante">
        <router-link
          class="menu-item"
          to="/setor-atual"
          :title="setorAtualNome"
        >
          <span class="material-icons menu-icon">apartment</span>
          <span class="menu-text">{{ setorAtualNome }}</span>
        </router-link>

        <router-link class="menu-item" to="/itens" title="Itens">
          <span class="material-icons menu-icon">inventory_2</span>
          <span class="menu-text">Itens</span>
        </router-link>
      </template>

      <!-- Default admin/management menu -->
      <template v-else>
        <router-link
          class="menu-item"
          to="/setor-atual"
          :title="setorAtualNome"
        >
          <span class="material-icons menu-icon">apartment</span>
          <span class="menu-text">{{ setorAtualNome }}</span>
        </router-link>

        <router-link
          v-if="setoresConsumidores.length > 0"
          class="menu-item"
          to="/setores-consumidores"
          title="Setores Consumidores"
        >
          <span class="material-icons menu-icon">store</span>
          <span class="menu-text">Setores Consumidores</span>
        </router-link>

        <router-link
          v-if="isAdminUser"
          class="menu-item"
          to="/users"
          title="Usuários"
        >
          <span class="material-icons menu-icon">group</span>
          <span class="menu-text">Usuários</span>
        </router-link>

        <router-link
          v-if="!hasSetorFornecedor"
          class="menu-item"
          to="/produtos"
          title="Produtos"
        >
          <span class="material-icons menu-icon">inventory</span>
          <span class="menu-text">Produtos</span>
        </router-link>

        <router-link
          v-if="!hasSetorFornecedor"
          class="menu-item"
          to="/fornecedores"
          title="Fornecedores"
        >
          <span class="material-icons menu-icon">business_center</span>
          <span class="menu-text">Fornecedores</span>
        </router-link>

        <!-- Submenu: Cadastros -->
        <div v-if="!hasSetorFornecedor" class="submenu-section">
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
              <router-link
                v-if="!hasSetorFornecedor"
                class="submenu-item"
                to="/unidades"
                title="Unidades"
              >
                <span class="material-icons menu-icon">map</span>
                <span class="menu-text">Unidades</span>
              </router-link>

              <router-link
                v-if="!hasSetorFornecedor"
                class="submenu-item"
                to="/grupoProduto"
                title="Grupos de Produtos"
              >
                <span class="material-icons menu-icon">label</span>
                <span class="menu-text">Grupos de Produtos</span>
              </router-link>

              <router-link
                v-if="!hasSetorFornecedor"
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
      </template>
    </nav>
  </aside>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import axios from "axios";
import { API_URL } from "@/config";

const store = useStore();
const router = useRouter();

const is_expanded = ref(false);
const submenuOpen = ref(false);
const consumidoresSubmenuOpen = ref(false);
const setoresConsumidores = ref([]);

const emit = defineEmits(["toggle"]);

// Verificar se o usuário é admin@admin.com
const isAdminUser = computed(() => {
  const user = store.state.user;
  return user && user.email === "admin@admin.com";
});

// Verificar se o setor atual tem um setor fornecedor (não é raiz/fornecedor/distribuidor)
const hasSetorFornecedor = computed(() => {
  const setorDetails = store.state.setorDetails;
  return (
    setorDetails &&
    (setorDetails.setor_fornecedor ||
      setorDetails.setor_fornecedor_id ||
      (setorDetails.fornecedores_relacionados &&
        setorDetails.fornecedores_relacionados.length > 0))
  );
});

// Verificar se o usuário possui perfil 'solicitante' no setor atual
const isSolicitante = computed(() => {
  const user = store.state.user;
  if (!user) return false;

  try {
    // tentar usar a lista carregada no store (listUsuariosSetor)
    const list = store.state.listUsuariosSetor || [];
    const found = list.find((u) => {
      const userId =
        u.usuario_id || u.user_id || u.id || (u.usuario && u.usuario.id);
      const perfil = (u.perfil || (u.pivot && u.pivot.perfil) || "")
        .toString()
        .toLowerCase();
      return (
        userId === user.id &&
        (perfil === "solicitante" || perfil.includes("solicitante"))
      );
    });

    if (found) return true;
  } catch (e) {
    console.warn("Erro ao avaliar isSolicitante:", e);
  }

  // fallback: checar roles/perfil no objeto user
  if (
    (user.roles && user.roles.includes && user.roles.includes("solicitante")) ||
    (user.perfil &&
      user.perfil.toString().toLowerCase().includes("solicitante"))
  )
    return true;

  return false;
});

// Obter o nome do setor atual
const setorAtualNome = computed(() => {
  const setorDetails = store.state.setorDetails;
  return setorDetails?.nome || "Setor Atual";
});

// Obter o nome da unidade do setor atual
const unidadeNome = computed(() => {
  const setorDetails = store.state.setorDetails;
  return setorDetails?.unidade?.nome || "ProGest";
});

// Obter a imagem da unidade baseada no nome
const getUnidadeImage = (nomeUnidade) => {
  if (!nomeUnidade) return null;

  // Mapear nomes de unidades para arquivos de imagem
  const imageMap = {
    "Crescêncio Silveira": "Crescêncio Silveira.png",
    "Hospital Afrânio Peixoto": "Hospital Afrânio Peixoto.png",
    "Hospital Geral": "Hospital Geral.png",
    CHVC: "Logo-CHVC .png",
    UPA: "UPA.png",
  };

  // Tentar encontrar correspondência exata ou parcial
  for (const [key, value] of Object.entries(imageMap)) {
    if (nomeUnidade.includes(key) || key.includes(nomeUnidade)) {
      return `/src/assets/unidades/${value}`;
    }
  }

  return null;
};

// Computed para a logo atual
const currentLogoSrc = computed(() => {
  if (is_expanded.value) {
    // Quando expandida, tentar mostrar a logo da unidade
    const unidadeImage = getUnidadeImage(unidadeNome.value);
    return unidadeImage || "/src/assets/logo-horizontal.png";
  } else {
    // Quando recolhida, mostrar o ícone
    return "/src/assets/logo-icon.png";
  }
});

// Carregar setores consumidores
const loadSetoresConsumidores = async () => {
  const setorDetails = store.state.setorDetails;
  if (!setorDetails || !setorDetails.id) return;

  try {
    const response = await axios.post(
      `${API_URL}/setores/listConsumers`,
      { id: setorDetails.id },
      {
        headers: {
          Authorization: `Bearer ${store.getters.getUserToken}`,
        },
      }
    );

    if (response.data.status && response.data.data) {
      setoresConsumidores.value = response.data.data;
    }
  } catch (error) {
    console.warn("Erro ao carregar setores consumidores:", error);
    setoresConsumidores.value = [];
  }
};

// Navegar para outro setor (Visualização Read-Only)
const navigateToSetor = async (setorId) => {
  try {
    router.push(`/setores-consumidores/${setorId}`);
  } catch (error) {
    console.error("Erro ao navegar para setor consumidor:", error);
  }
};

const handleMouseEnter = () => {
  is_expanded.value = true;
};

const handleMouseLeave = () => {
  is_expanded.value = false;
};

const toggleSubmenu = () => {
  submenuOpen.value = !submenuOpen.value;
};

const toggleConsumidoresSubmenu = () => {
  consumidoresSubmenuOpen.value = !consumidoresSubmenuOpen.value;
};

onMounted(() => {
  const savedSubmenu = localStorage.getItem("submenuOpen");
  submenuOpen.value = savedSubmenu === "true";

  const savedConsumidoresSubmenu = localStorage.getItem(
    "consumidoresSubmenuOpen"
  );
  consumidoresSubmenuOpen.value = savedConsumidoresSubmenu === "true";

  // Carregar setores consumidores
  loadSetoresConsumidores();
});

watch(submenuOpen, (val) => {
  localStorage.setItem("submenuOpen", val);
});

watch(consumidoresSubmenuOpen, (val) => {
  localStorage.setItem("consumidoresSubmenuOpen", val);
});

// Recarregar consumidores quando o setor atual mudar
watch(
  () => store.state.setorDetails,
  () => {
    loadSetoresConsumidores();
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 80px;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  color: #ffffff;
  overflow: hidden;
  overflow-y: auto;
  padding: 1rem 0;
  transition: width 0.3s ease;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.3);

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
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    margin-bottom: 0.5rem;

    .logo-image {
      max-width: 45px;
      height: auto;
      transition: max-width 0.3s ease;
      filter: brightness(0) invert(1);
    }
  }

  &.is-expanded {
    .logo-section {
      .logo-image {
        max-width: 220px;
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
      color: rgba(255, 255, 255, 0.6);
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
    background: rgba(255, 255, 255, 0.2);
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
    color: rgba(255, 255, 255, 0.9);
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
      color: rgba(255, 255, 255, 0.9);
    }

    .menu-text {
      opacity: 0;
      transition: opacity 0.3s ease;
      text-align: left;
      flex: 1;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      transform: translateX(2px);
    }

    &.router-link-active,
    &.router-link-exact-active {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
      border-left: 3px solid #64b5f6;
      padding-left: calc(1rem - 3px);
      font-weight: 500;
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
        color: rgba(255, 255, 255, 0.9);

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
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;

        &:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        &.router-link-active,
        &.router-link-exact-active {
          background: rgba(255, 255, 255, 0.2);
          border-left-color: #64b5f6;
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

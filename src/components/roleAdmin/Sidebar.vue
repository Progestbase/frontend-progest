<template>
  <aside :class="`${is_expanded ? 'is-expanded' : ''}`">
    <div class="logo">
      <img src="/src/assets/logo-horizontal.png" alt="Logo" />
    </div>

    <div class="menu-toggle-wrap">
      <button class="menu-toggle" @click="ToggleMenu">
        <span class="material-icons">keyboard_double_arrow_right</span>
      </button>
    </div>
    <div class="menu">
      <router-link class="button" to="/dashboard">
        <span class="material-icons">home</span>
        <span class="text">Tela Inicial</span>
      </router-link>
    </div>
    <h3>Cadastros</h3>
    <div class="menu">
      <router-link class="button" to="/users">
        <span class="material-icons">person</span>
        <span class="text">Usuários</span>
      </router-link>
      <router-link class="button" to="/produtos">
        <span class="material-icons">holiday_village</span>
        <span class="text">Unidades</span>
      </router-link>
      <router-link class="button" to="/fornecedores">
        <span class="material-icons">apartment</span>
        <span class="text">Unidade Consumidora</span>
      </router-link>
      <router-link class="button" to="/coordenacao">
        <span class="material-icons">groups</span>
        <span class="text">Coordenação</span>
      </router-link>
      <router-link class="button" to="/fornecedores">
        <span class="material-icons">contact_page</span>
        <span class="text">Fornecedores</span>
      </router-link>
      <router-link class="button" to="/itens">
        <span class="material-icons">library_books</span>
        <span class="text">Itens</span>
      </router-link>
      <router-link class="button" to="/">
        <span class="material-icons">category</span>
        <span class="text">Categoria de Itens</span>
      </router-link>


    </div>



  </aside>
</template>


<script setup>
import { ref } from 'vue';

const is_expanded = ref(false)

const ToggleMenu = () => {
  is_expanded.value = !is_expanded.value
}
</script>


<style lang="scss" scoped>
aside {
  display: flex;
  flex-direction: column;
  width: calc(2.8rem + 32px);
  min-height: 100vh;
  overflow: hidden;
  overflow-y: auto;
  padding: 1rem;

  background-color: var(--dark);
  color: var(--light);

  transition: 0.2s ease-out;

  .logo {
    margin-bottom: 1rem;

    img {
      width: 70%;
    }
  }

  .menu-toggle-wrap {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;


    position: relative;
    top: 0;
    transition: 0.2s ease-out;

    .menu-toggle {
      transition: 0.2s ease-out;

      .material-icons {
        font-size: 1.5rem;
        color: var(--light);
        transition: 0.2s ease-out;
      }

      &:hover {
        .material-icons {
          color: var(--primary);
          transform: translateX(0.5rem);
        }
      }
    }
  }

  h3,
  .button .text {
    opacity: 0;
    transition: 0.3s ease-out;
  }

  h3 {
    color: var(--grey);
    font-size: 1rem;
    text-transform: uppercase;
  }

  .menu {
    margin: 0 -1rem;

    .button {
      display: flex;
      align-items: center;
      text-decoration: none;

      padding: 0.5rem 1rem;
      transition: 0.2rem ease-out;

      .material-icons {
        font-size: 1.5rem;
        color: var(--light);
        transition: 0.2s ease-out;
      }

      .text {
        color: var(--light);
        transition: 0.2s ease-out;
      }

      &:hover,
      &.router-link-exact-active {
        background-color: var(--dark-alt);

        .material-icons,
        text {
          color: var(--primary);
        }
      }

      .router-link-exact-active {
        border-right: 5px solid var(--primary);
      }

    }
  }

  &.is-expanded {
    width: var(--sidebar-width);

    .menu-toggle-wrap {
      top: -3rem;
      margin-bottom: -1rem;

      .menu-toggle {
        transform: rotate(-180deg);
      }
    }

    h3,
    .button .text {
      opacity: 1;
      margin-bottom: 0.5rem;
      margin-top: 0.5rem;
    }

    .button {
      .material-icons {
        margin-right: 1rem;
      }
    }

  }

  @media (max-width: 768px) {
    // position: fixed;
    z-index: 99;

  }
}
</style>

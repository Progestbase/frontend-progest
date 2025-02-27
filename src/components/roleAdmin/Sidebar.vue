<template>
  <aside class="col-span-2 bg-azul-eclipse text-white flex flex-col">
    <h1
      class="text-4xl font-bold mb-4 border-b-2 border-white py-[17px] w-full text-center"
    >
      Progest
    </h1>
    <nav>
      <ul class="space-y-2">
        <li>
          <router-link
            to="/dashboard"
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-white hover:bg-opacity-10"
            active-class="bg-white bg-opacity-25 border-l-4 pl-5 rounded-l"
          >
            <img
              class="w-8"
              src="../../../src/components/icons/casa.svg"
              alt="Ícone casa"
            />Dashboard
          </router-link>
        </li>

        <!-- Cadastros -->
        <li class="group">
          <div
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-white hover:bg-opacity-10 cursor-pointer"
          >
            <img
              class="w-8"
              src="../../../src/components/icons/cadastro.svg"
              alt="Ícone cadastros"
            />
            Cadastros
            <img
              class="ml-16 transition-transform duration-300 group-hover:rotate-90"
              src="../../../src/components/icons/seta.svg"
              alt="Ícone seta"
            />
          </div>
          <ul class="pl-12 hidden group-hover:block animate-fade-in">
            <li>
              <router-link
                to="/cadastros/novo"
                class="block p-2 text-white text-xs relative group"
              >
                <span class="underline-effect">Unidade consumidora</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/cadastros/consulta"
                class="block p-2 text-white text-xs relative group"
              >
                <span class="underline-effect">Coordenação</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/cadastros/novo"
                class="block p-2 text-white text-xs relative group"
              >
                <span class="underline-effect">Usuários</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/cadastros/novo"
                class="block p-2 text-white text-xs relative group"
              >
                <span class="underline-effect">Tipos de materiais/medicamentos</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/cadastros/novo"
                class="block p-2 text-white text-xs relative group"
              >
                <span class="underline-effect">Unidades</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/cadastros/novo"
                class="block p-2 text-white text-xs relative group"
              >
                <span class="underline-effect">Fornecedores</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/cadastros/novo"
                class="block p-2 text-white text-xs relative group"
              >
                <span class="underline-effect">Itens</span>
              </router-link>
            </li>
          </ul>
        </li>

        <li>
          <router-link
            to="/entradas"
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-white hover:bg-opacity-10"
            active-class="bg-white bg-opacity-25 border-l-4 rounded-l"
          >
            <img
              class="w-8"
              src="../../../src/components/icons/entradas.svg"
              alt="Ícone entradas"
            />
            Entradas
          </router-link>
        </li>

        <li>
          <router-link
            to="/estoque"
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-white hover:bg-opacity-10"
            active-class="bg-white bg-opacity-25 border-l-4 rounded-l"
          >
            <img
              class="w-8"
              src="../../../src/components/icons/estoque.svg"
              alt="Ícone estoque"
            />
            Estoque
          </router-link>
        </li>

        <!-- Movimentações -->
        <li class="group">
          <div
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-white hover:bg-opacity-10 cursor-pointer"
          >
            <img
              class="w-8"
              src="../../../src/components/icons/movimentacoes.svg"
              alt="Ícone movimentações"
            />
            Movimentações
            <img
              class="ml-[22px] transition-transform duration-300 group-hover:rotate-90"
              src="../../../src/components/icons/seta.svg"
              alt="Ícone seta"
            />
          </div>
          <ul class="space-y-2 pl-12 hidden group-hover:block animate-fade-in">
            <li>
              <router-link
                to="/cadastros/novo"
                class="block p-2 text-white text-xs relative group"
              >
                <span class="underline-effect">Pedidos</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/cadastros/novo"
                class="block p-2 text-white text-xs relative group"
              >
                <span class="underline-effect">Devoluções</span>
              </router-link>
            </li>
          </ul>
        </li>

        <!-- Relatórios -->
        <li class="group">
          <div
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-white hover:bg-opacity-10 cursor-pointer"
          >
            <img
              class="w-8"
              src="../../../src/components/icons/relatorios.svg"
              alt="Ícone relatórios"
            />
            Relatórios
            <img
              class="ml-16 transition-transform duration-300 group-hover:rotate-90"
              src="../../../src/components/icons/seta.svg"
              alt="Ícone seta"
            />
          </div>
          <ul class="space-y-2 pl-12 hidden group-hover:block animate-fade-in">
            <li>
              <router-link
                to="/cadastros/novo"
                class="block p-2 text-white text-xs relative group"
              >
                <span class="underline-effect">Novo Cadastro</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/cadastros/novo"
                class="block p-2 text-white text-xs relative group"
              >
                <span class="underline-effect">Novo Cadastro</span>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </aside>
</template>


<style scoped>
.underline-effect {
  position: relative;
}

.underline-effect::after {
  content: "";
  position: absolute;
  top: 110%;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: white;
  border-radius: 1rem;
  transition: width 0.3s ease, left 0.3s ease;
}

.underline-effect:hover::after {
  width: 100%;
  left: 0;
}

.group-hover .group-hover\:rotate-90 {
  transform: rotate(90deg);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease;
}
</style>
  
<template>
  <div class="admin-layout">
    <!-- Sidebar fixo -->
    <Sidebar class="sidebar" />
    <!-- Conteúdo principal -->
    <main class="content">
      <Header
        :userName="userName"
        :userRole="userRole"
        :headerName="headerName"
      />

      <!-- WIP Page -->
      <section
        class="flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-6"
      >
        <div class="pt-4">
          <div
            class="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <span class="text-blue-600 text-sm">⏳</span>
            <span class="text-blue-700 font-medium text-sm"
              >Work in Progress</span
            >
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
import { API_URL } from "@/config";
import Sidebar from "@/components/roleAdmin/Sidebar.vue";
import Header from "@/components/roleAdmin/Header.vue";

const router = useRouter();
const store = useStore();

const apiUrl = API_URL;
const userName = ref("");
const userRole = ref("Admin");
const headerName = ref("");

const fetchUserInfo = async () => {
  try {
    const token = store.getters.getUserToken;
    if (!token) {
      console.error("Token não encontrado");
      router.push("/login");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(`${apiUrl}/user`, { headers });
    userName.value = response.data.name || "Usuário";
    userRole.value = response.data.role || "Admin";
  } catch (error) {
    console.error("Erro ao buscar informações do usuário:", error);
    router.push("/login");
  }
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  height: 100vh;

  .sidebar {
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    background-color: var(--light);
    display: flex;
    flex-direction: column;
  }
}
</style>

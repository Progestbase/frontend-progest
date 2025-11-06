<template>
  <ToastProvider>
    <div id="app">
      <router-view />
    </div>
    <Toaster />
  </ToastProvider>
</template>
<script>
import { defineComponent } from "vue";
import { ToastProvider, Toaster } from "@/components/ui/toast";

export default defineComponent({
  name: "App",
  components: {
    ToastProvider,
    Toaster,
  },
});
</script>

<style lang="scss"></style>

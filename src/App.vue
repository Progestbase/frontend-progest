<template>
  <div id="app">
    <router-view />
    <Toaster />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Toaster } from "@/components/ui/toast";

export default defineComponent({
  name: "App",
  components: {
    Toaster,
  },
});
</script>

<style lang="scss"></style>
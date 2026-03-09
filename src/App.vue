<template>
  <div id="app">
    <router-view />
    <Toaster />
    <FeedbackModal />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Toaster } from "@/components/ui/toast";
import { FeedbackModal } from "@/components/ui/feedback-modal";

export default defineComponent({
  name: "App",
  components: {
    Toaster,
    FeedbackModal,
  },
});
</script>

<style lang="scss"></style>
<script setup lang="ts">
import { cn } from "@/lib/utils";

interface Props {
  size?: "sm" | "md" | "lg";
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
});

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};
</script>

<template>
  <div
    :class="
      cn(
        'animate-spin rounded-full border-2 border-blue-200 border-t-blue-600',
        sizeClasses[size],
        props.class
      )
    "
  />
</template>

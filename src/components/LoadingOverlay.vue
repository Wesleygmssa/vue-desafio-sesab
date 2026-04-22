<template>
  <div
    v-if="show"
    class="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-10"
  >
    <div class="flex items-center gap-3">
      <div
        class="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"
      ></div>
      <span class="text-gray-600 font-medium">
        {{ text }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: 'Loading...',
  },
});
</script>

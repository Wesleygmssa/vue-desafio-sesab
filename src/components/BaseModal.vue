<script setup>
defineProps({
  show: Boolean,
  title: String,
});

defineEmits(['close']);
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
  >
    <div class="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-xl">
      <!-- HEADER -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800">
          {{ title }}
        </h2>

        <button
          @click="$emit('close')"
          class="cursor-pointertext-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>
      </div>

      <!-- CONTENT -->
      <slot />
    </div>
  </div>
</template>

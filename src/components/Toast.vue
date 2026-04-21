<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'success',
  },
  position: {
    type: String,
    default: 'top-right',
  },
  size: {
    type: String,
    default: 'md',
  },
});

/* BASE */
const baseStyle =
  'fixed rounded-xl shadow-lg z-50 text-white transition-all duration-300 ease-out transform';

/* TIPOS */
const typeStyle = computed(() => {
  return (
    {
      success: 'bg-green-600 border border-green-700',
      error: 'bg-red-600 border border-red-700',
      warning: 'bg-yellow-500 text-black border border-yellow-600',
    }[props.type] || 'bg-gray-800'
  );
});

const positionStyle = computed(() => {
  return {
    'top-right': 'top-14 right-6',
    'top-left': 'top-14 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  }[props.position];
});

/* TAMANHO */
const sizeStyle = computed(() => {
  return {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-5 py-4',
    lg: 'text-lg px-6 py-5',
  }[props.size];
});
</script>

<template>
  <div
    v-if="show"
    :class="[
      baseStyle,
      typeStyle,
      positionStyle,
      sizeStyle,

      'opacity-100 translate-y-0 scale-100',
    ]"
    class="animate-toast-in"
  >
    {{ message }}
  </div>
</template>

<style scoped>
@keyframes toast-in {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-toast-in {
  animation: toast-in 0.25s ease-out;
}
</style>

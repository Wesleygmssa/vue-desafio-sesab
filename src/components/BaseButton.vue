<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: 'Botão',
  },
  color: {
    type: String,
    default: 'blue',
  },
  size: {
    type: String,
    default: 'md', // sm | md | lg
  },
  width: {
    type: String,
    default: 'auto', // auto | full | fit
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

// 🎨 cor
const colorClass = computed(() => {
  return (
    {
      red: 'bg-red-500 hover:bg-red-600',
      blue: 'bg-blue-500 hover:bg-blue-600',
      green: 'bg-green-500 hover:bg-green-600',
      gray: 'bg-gray-500 hover:bg-gray-600',
      cyan: 'bg-cyan-500 hover:bg-cyan-600',
    }[props.color] || 'bg-blue-500'
  );
});

// 📏 tamanho
const sizeClass = computed(() => {
  return (
    {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }[props.size] || 'px-4 py-2 text-base'
  );
});

// 📐 largura
const widthClass = computed(() => {
  return (
    {
      full: 'w-full',
      fit: 'w-fit',
      auto: 'w-auto',
    }[props.width] || 'w-auto'
  );
});
</script>

<template>
  <button
    :class="[
      'text-white rounded transition font-medium flex items-center justify-center',
      colorClass,
      sizeClass,
      widthClass,
      loading || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ]"
    :disabled="loading || disabled"
  >
    {{ loading ? 'Carregando...' : label }}
  </button>
</template>

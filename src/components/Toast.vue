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
    default: 'success', // success | error | warning
  },
  position: {
    type: String,
    default: 'top-right', // top-right | top-left | bottom-right | bottom-left
  },
  size: {
    type: String,
    default: 'md', // sm | md | lg
  },
});

const baseStyle =
  'fixed px-5 py-3 rounded-xl shadow-lg text-white z-50 transition-all duration-300';

const typeStyle = computed(() => {
  return (
    {
      success: 'bg-[#3448EB]',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
    }[props.type] || 'bg-gray-800'
  );
});

const positionStyle = computed(() => {
  return {
    'top-right': 'top-15 right-15',
    'top-left': 'top-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  }[props.position];
});

const sizeStyle = computed(() => {
  return {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-5 py-5',
    lg: 'text-lg px-6 py-4',
  }[props.size];
});
</script>

<template>
  <div v-if="show" :class="[baseStyle, typeStyle, positionStyle, sizeStyle]">
    {{ message }}
  </div>
</template>

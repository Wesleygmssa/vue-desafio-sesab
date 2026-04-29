<template>
  <div class="relative w-max group">
    <!-- Trigger -->
    <span class="inline-block">
      <slot />
    </span>

    <!-- Tooltip -->
    <div
      :class="[
        'absolute z-50 px-2 py-1 text-xs text-white bg-black rounded whitespace-nowrap',
        'transition-all duration-200',
        'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100',
        positionClass,
      ]"
    >
      {{ text }}

      <!-- seta -->
      <div
        class="w-2 h-2 bg-black rotate-45 absolute"
        :class="arrowClass"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: { type: String, required: true },
  position: { type: String, default: 'top' }, // top, bottom, left, right
});

const positionClass = computed(() => {
  return {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[props.position];
});

const arrowClass = computed(() => {
  return {
    top: 'left-1/2 -translate-x-1/2 -bottom-1',
    bottom: 'left-1/2 -translate-x-1/2 -top-1',
    left: '-right-1 top-1/2 -translate-y-1/2',
    right: '-left-1 top-1/2 -translate-y-1/2',
  }[props.position];
});
</script>

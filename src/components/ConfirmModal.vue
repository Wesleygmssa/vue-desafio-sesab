<script setup>
import BaseButton from '@/components/BaseButton.vue';

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirmar ação',
  },
  message: {
    type: String,
    default: '',
  },
  itemName: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'Excluir',
  },
  cancelText: {
    type: String,
    default: 'Cancelar',
  },
  confirmColor: {
    type: String,
    default: 'red',
  },
});

defineEmits(['close', 'confirm']);
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
      <h2 class="text-lg font-bold mb-3">
        {{ title }}
      </h2>

      <p class="mb-6">
        <slot>
          {{ message }}
          Deseja realmente {{ confirmText.toLowerCase() }}
          <strong v-if="itemName">{{ itemName }}</strong
          >?
        </slot>
      </p>

      <div class="flex justify-end gap-3">
        <BaseButton :label="cancelText" color="gray" @click="$emit('close')" />

        <BaseButton
          :label="confirmText"
          :color="confirmColor"
          @click="$emit('confirm')"
        />
      </div>
    </div>
  </div>
</template>

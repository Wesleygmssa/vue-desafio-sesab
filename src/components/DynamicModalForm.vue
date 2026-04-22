<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Formulário',
  },
  modelValue: {
    type: Object,
    required: true,
  },
  fields: {
    type: Array,
    required: true,
    /**
     * Ex:
     * [
     *  { key: 'logradouro', label: 'Logradouro', type: 'text' },
     *  { key: 'estado', label: 'Estado', type: 'text', maxlength: 2 }
     * ]
     */
  },
  loading: Boolean,
});

const emit = defineEmits([
  'update:show',
  'update:modelValue',
  'save',
  'cancel',
]);

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

function close() {
  emit('update:show', false);
  emit('cancel');
}

function save() {
  emit('save', form.value);
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
  >
    <div class="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-xl">
      <h2 class="text-lg font-semibold mb-4">{{ title }}</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="field in fields" :key="field.key">
          <input
            v-model="form[field.key]"
            :type="field.type || 'text'"
            :placeholder="field.label"
            :maxlength="field.maxlength"
            class="input w-full"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button
          @click="close"
          class="cursor-pointer px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>

        <button
          @click="save"
          :disabled="loading"
          class="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          <span v-if="loading">Salvando...</span>
          <span v-else>Salvar</span>
        </button>
      </div>
    </div>
  </div>
</template>

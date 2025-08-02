<template>
  <ClientOnly>
    <ckeditor
        v-if="editor"
        :editor="editor"
        v-model="data"
        :config="editorConfig"
    />
  </ClientOnly>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  config: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue'])

const { $ckeditorEditor } = useNuxtApp()

const data = ref(props.modelValue)
const editor = $ckeditorEditor

const editorConfig = ref({
  toolbar: [
    'heading',
    '|',
    'bold', 'italic', 'underline', 'strikethrough',
    '|',
    'link', 'imageUpload', 'insertTable',
    '|',
    'bulletedList', 'numberedList', 'todoList',
    '|',
    'blockQuote', 'codeBlock',
    '|',
    'alignment', 'outdent', 'indent',
    '|',
    'undo', 'redo',
    '|',
    'removeFormat'
  ],
  ...props.config
})

watch(() => props.modelValue, (val) => {
  if (val !== data.value) data.value = val
})

watch(data, (val) => {
  emit('update:modelValue', val)
})
</script>

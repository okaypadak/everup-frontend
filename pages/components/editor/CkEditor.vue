<template>
  <ClientOnly>
    <ckeditor :editor="editor" v-model="data" :config="editorConfig" @input="emitChange" />
  </ClientOnly>
</template>

<script setup>
import { ref, watch } from 'vue'
import CKEditor from '@ckeditor/ckeditor5-vue'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

const props = defineProps({
  modelValue: { type: String, default: '' },
  config: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

const editor = ClassicEditor
const data = ref(props.modelValue)

const editorConfig = {
  toolbar: [
    'heading', '|', 'bold', 'italic', 'underline', 'strikethrough',
    '|', 'link', 'bulletedList', 'numberedList',
    '|', 'blockQuote', 'undo', 'redo'
  ],
  ...props.config
}

watch(() => props.modelValue, (val) => {
  if (val !== data.value) data.value = val
})

function emitChange(evt, editorInstance) {
  const html = editorInstance.getData()
  emit('update:modelValue', html)
}
</script>

<script>
export default {
  components: {
    ckeditor: CKEditor.component
  }
}
</script>

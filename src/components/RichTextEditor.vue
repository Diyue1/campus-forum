<template>
  <div class="rich-editor">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <n-space>
        <n-button-group>
          <n-button
            size="small"
            @click="execCommand('bold')"
          >
            <template #icon>
              <n-icon><BoldIcon /></n-icon>
            </template>
          </n-button>
          <n-button
            size="small"
            @click="execCommand('italic')"
          >
            <template #icon>
              <n-icon><ItalicIcon /></n-icon>
            </template>
          </n-button>
          <n-button
            size="small"
            @click="execCommand('underline')"
          >
            <template #icon>
              <n-icon><UnderlineIcon /></n-icon>
            </template>
          </n-button>
        </n-button-group>

        <n-button-group>
          <n-button
            size="small"
            @click="execCommand('insertUnorderedList')"
          >
            <template #icon>
              <n-icon><ListIcon /></n-icon>
            </template>
          </n-button>
          <n-button
            size="small"
            @click="execCommand('insertOrderedList')"
          >
            <template #icon>
              <n-icon><ListNumberIcon /></n-icon>
            </template>
          </n-button>
        </n-button-group>

        <n-button
          size="small"
          @click="insertLink"
        >
          <template #icon>
            <n-icon><LinkIcon /></n-icon>
          </template>
        </n-button>

        <n-button
          size="small"
          @click="insertImage"
        >
          <template #icon>
            <n-icon><ImageIcon /></n-icon>
          </template>
        </n-button>

        <n-button
          size="small"
          @click="insertEmoji"
        >
          <template #icon>
            <n-icon><HappyIcon /></n-icon>
          </template>
        </n-button>
      </n-space>
    </div>

    <!-- 编辑区域 -->
    <div
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      :placeholder="placeholder"
      @input="handleInput"
      @paste="handlePaste"
    />

    <!-- 表情选择器 -->
    <n-popover
      v-model:show="showEmojiPicker"
      trigger="manual"
      placement="bottom"
    >
      <template #trigger>
        <div ref="emojiTrigger" />
      </template>
      <div class="emoji-picker">
        <div
          v-for="emoji in emojis"
          :key="emoji"
          class="emoji-item"
          @click="insertEmojiText(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </n-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import {
  Text as BoldIcon,
  Text as ItalicIcon,
  Text as UnderlineIcon,
  List as ListIcon,
  List as ListNumberIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Happy as HappyIcon
} from '@vicons/ionicons5'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const message = useMessage()
const editorRef = ref<HTMLDivElement>()
const showEmojiPicker = ref(false)

const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '👍', '👎', '👏', '🙌', '👋', '🤝', '🙏', '💪', '❤️', '💔', '💯', '🔥', '✨', '🎉', '🎊']

const execCommand = (command: string) => {
  document.execCommand(command, false)
  editorRef.value?.focus()
}

const insertLink = () => {
  const url = prompt('请输入链接地址：')
  if (url) {
    document.execCommand('createLink', false, url)
  }
}

const insertImage = () => {
  const url = prompt('请输入图片地址：')
  if (url) {
    document.execCommand('insertImage', false, url)
  }
}

const insertEmoji = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const insertEmojiText = (emoji: string) => {
  if (editorRef.value) {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(emoji))
      range.collapse(false)
    }
    handleInput()
  }
  showEmojiPicker.value = false
}

const handleInput = () => {
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML)
  }
}

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain')
  if (text) {
    document.execCommand('insertText', false, text)
  }
}

onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
  }
})
</script>

<style scoped>
.rich-editor {
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.editor-toolbar {
  padding: 8px;
  border-bottom: 1px solid rgba(255, 107, 53, 0.2);
  background: rgba(255, 255, 255, 0.03);
}

.editor-content {
  min-height: 200px;
  max-height: 500px;
  padding: 16px;
  overflow-y: auto;
  outline: none;
  color: #fff;
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: rgba(255, 255, 255, 0.4);
}

.emoji-picker {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  max-width: 320px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-item {
  font-size: 24px;
  cursor: pointer;
  text-align: center;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.emoji-item:hover {
  background: rgba(255, 107, 53, 0.2);
  transform: scale(1.2);
}
</style>


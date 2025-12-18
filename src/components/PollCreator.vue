<template>
  <n-card
    title="创建投票"
    class="poll-creator"
  >
    <n-space
      vertical
      :size="16"
    >
      <n-form-item label="投票问题">
        <n-input
          v-model:value="poll.question"
          placeholder="请输入投票问题"
        />
      </n-form-item>

      <n-form-item label="投票选项">
        <n-space
          vertical
          style="width: 100%"
        >
          <n-input
            v-for="(option, index) in poll.options"
            :key="index"
            v-model:value="poll.options[index]"
            :placeholder="`选项 ${index + 1}`"
          >
            <template #suffix>
              <n-button
                v-if="poll.options.length > 2"
                text
                @click="removeOption(index)"
              >
                <template #icon>
                  <n-icon><CloseIcon /></n-icon>
                </template>
              </n-button>
            </template>
          </n-input>
          
          <n-button
            v-if="poll.options.length < 10"
            dashed
            block
            @click="addOption"
          >
            <template #icon>
              <n-icon><AddIcon /></n-icon>
            </template>
            添加选项
          </n-button>
        </n-space>
      </n-form-item>

      <n-space>
        <n-checkbox v-model:checked="poll.multiple">
          允许多选
        </n-checkbox>
        <n-checkbox v-model:checked="poll.anonymous">
          匿名投票
        </n-checkbox>
      </n-space>

      <n-form-item label="截止时间">
        <n-date-picker
          v-model:value="poll.endTime"
          type="datetime"
          placeholder="选择截止时间（可选）"
          clearable
        />
      </n-form-item>

      <n-space justify="end">
        <n-button @click="cancel">
          取消
        </n-button>
        <n-button
          type="primary"
          @click="create"
        >
          创建投票
        </n-button>
      </n-space>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import {
  Add as AddIcon,
  Close as CloseIcon
} from '@vicons/ionicons5'

const emit = defineEmits<{
  'create': [poll: any]
  'cancel': []
}>()

const message = useMessage()

const poll = ref({
  question: '',
  options: ['', ''],
  multiple: false,
  anonymous: false,
  endTime: null as number | null
})

const addOption = () => {
  if (poll.value.options.length < 10) {
    poll.value.options.push('')
  }
}

const removeOption = (index: number) => {
  if (poll.value.options.length > 2) {
    poll.value.options.splice(index, 1)
  }
}

const create = () => {
  if (!poll.value.question.trim()) {
    message.error('请输入投票问题')
    return
  }

  const validOptions = poll.value.options.filter(opt => opt.trim())
  if (validOptions.length < 2) {
    message.error('至少需要2个选项')
    return
  }

  emit('create', {
    ...poll.value,
    options: validOptions
  })
}

const cancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.poll-creator {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 107, 53, 0.2);
}
</style>


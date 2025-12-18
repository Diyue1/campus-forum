<template>
  <n-card
    title="每日签到"
    class="checkin-panel"
  >
    <n-space
      vertical
      :size="16"
    >
      <!-- 签到状态 -->
      <div class="checkin-status">
        <div
          v-if="!todayChecked"
          class="not-checked"
        >
          <n-icon
            size="48"
            color="#FF6B35"
          >
            <CalendarIcon />
          </n-icon>
          <n-text>今日未签到</n-text>
        </div>
        <div
          v-else
          class="checked"
        >
          <n-icon
            size="48"
            color="#4CAF50"
          >
            <CheckmarkCircleIcon />
          </n-icon>
          <n-text>今日已签到</n-text>
        </div>
      </div>

      <!-- 签到信息 -->
      <n-space
        vertical
        :size="8"
      >
        <n-space justify="space-between">
          <n-text depth="3">
            连续签到
          </n-text>
          <n-text strong>
            {{ continuousDays }} 天
          </n-text>
        </n-space>
        <n-space justify="space-between">
          <n-text depth="3">
            累计签到
          </n-text>
          <n-text strong>
            {{ totalDays }} 天
          </n-text>
        </n-space>
        <n-space justify="space-between">
          <n-text depth="3">
            获得经验
          </n-text>
          <n-text
            strong
            type="warning"
          >
            +{{ todayExp }} EXP
          </n-text>
        </n-space>
      </n-space>

      <!-- 签到按钮 -->
      <n-button
        type="primary"
        block
        size="large"
        :disabled="todayChecked"
        :loading="loading"
        @click="handleCheckIn"
      >
        <template #icon>
          <n-icon><GiftIcon /></n-icon>
        </template>
        {{ todayChecked ? '已签到' : '立即签到' }}
      </n-button>

      <!-- 签到日历 -->
      <n-divider style="margin: 8px 0" />
      <div class="checkin-calendar">
        <n-text
          strong
          style="margin-bottom: 8px; display: block"
        >
          本月签到记录
        </n-text>
        <div class="calendar-grid">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            class="calendar-day"
            :class="{
              'checked': day.checked,
              'today': day.isToday
            }"
          >
            {{ day.day }}
          </div>
        </div>
      </div>

      <!-- 签到奖励 -->
      <n-collapse>
        <n-collapse-item
          title="签到奖励规则"
          name="rewards"
        >
          <n-space
            vertical
            :size="8"
          >
            <n-text depth="3">
              • 每日签到：+5 经验
            </n-text>
            <n-text depth="3">
              • 连续3天：+10 经验
            </n-text>
            <n-text depth="3">
              • 连续7天：+20 经验
            </n-text>
            <n-text depth="3">
              • 连续30天：+100 经验 + 专属徽章
            </n-text>
          </n-space>
        </n-collapse-item>
      </n-collapse>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { db } from '@/utils/database'
import {
  Calendar as CalendarIcon,
  CheckmarkCircle as CheckmarkCircleIcon,
  Gift as GiftIcon
} from '@vicons/ionicons5'

const message = useMessage()
const userStore = useUserStore()
const loading = ref(false)

// 签到数据
const todayChecked = ref(false)
const continuousDays = ref(0)
const totalDays = ref(0)
const todayExp = ref(5)
const checkinHistory = ref<string[]>([])

// 加载签到数据
const loadCheckInData = () => {
  if (!userStore.currentUser) return

  const key = `checkin_${userStore.currentUser.id}`
  const data = localStorage.getItem(key)
  
  if (data) {
    const checkinData = JSON.parse(data)
    checkinHistory.value = checkinData.history || []
    continuousDays.value = checkinData.continuous || 0
    totalDays.value = checkinData.total || 0
    
    // 检查今天是否已签到
    const today = new Date().toDateString()
    todayChecked.value = checkinHistory.value.includes(today)
  }
}

// 签到
const handleCheckIn = async () => {
  if (!userStore.currentUser) {
    message.error('请先登录')
    return
  }

  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    // 更新签到历史
    checkinHistory.value.push(today)
    
    // 计算连续签到天数
    if (checkinHistory.value.includes(yesterday)) {
      continuousDays.value++
    } else {
      continuousDays.value = 1
    }
    
    totalDays.value++
    
    // 计算奖励经验
    let exp = 5
    if (continuousDays.value >= 30) {
      exp = 100
    } else if (continuousDays.value >= 7) {
      exp = 20
    } else if (continuousDays.value >= 3) {
      exp = 10
    }
    todayExp.value = exp
    
    // 保存签到数据
    const key = `checkin_${userStore.currentUser.id}`
    localStorage.setItem(key, JSON.stringify({
      history: checkinHistory.value,
      continuous: continuousDays.value,
      total: totalDays.value
    }))
    
    // 更新用户经验
    const currentUser = userStore.currentUser
    db.updateUser(currentUser.id, {
      exp: (currentUser.exp || 0) + exp
    })
    
    todayChecked.value = true
    message.success(`签到成功！获得 ${exp} 经验`)
    
    // 连续签到奖励提示
    if (continuousDays.value === 30) {
      message.success('🎉 连续签到30天！获得专属徽章！', { duration: 5000 })
    } else if (continuousDays.value === 7) {
      message.success('🔥 连续签到7天！继续保持！', { duration: 3000 })
    }
  } catch (error) {
    message.error('签到失败，请重试')
  } finally {
    loading.value = false
  }
}

// 生成日历
const calendarDays = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = now.toDateString()
  
  const days = []
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    const dateStr = date.toDateString()
    days.push({
      day: i,
      date: dateStr,
      checked: checkinHistory.value.includes(dateStr),
      isToday: dateStr === today
    })
  }
  
  return days
})

onMounted(() => {
  loadCheckInData()
})
</script>

<style scoped>
.checkin-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.checkin-status {
  text-align: center;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
}

.checkin-status > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 12px;
  transition: all 0.3s ease;
}

.calendar-day.checked {
  background: rgba(76, 175, 80, 0.3);
  color: #4CAF50;
  font-weight: bold;
}

.calendar-day.today {
  border: 2px solid #FF6B35;
}
</style>


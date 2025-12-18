<template>
  <div class="feature-showcase">
    <n-card
      title="🎉 论坛新功能"
      class="showcase-card"
    >
      <n-tabs
        type="line"
        animated
      >
        <!-- 草稿箱 -->
        <n-tab-pane
          name="drafts"
          tab="📝 草稿箱"
        >
          <n-space vertical>
            <n-alert
              type="info"
              title="草稿箱功能"
            >
              自动保存您的创作，永不丢失灵感！
            </n-alert>
            <n-button
              type="primary"
              @click="showDrafts"
            >
              查看我的草稿 ({{ drafts.length }})
            </n-button>
          </n-space>
        </n-tab-pane>

        <!-- 举报功能 -->
        <n-tab-pane
          name="report"
          tab="🚨 举报"
        >
          <n-space vertical>
            <n-alert
              type="warning"
              title="举报功能"
            >
              发现不当内容？立即举报，共建和谐社区！
            </n-alert>
            <n-space>
              <n-tag type="error">
                垃圾信息
              </n-tag>
              <n-tag type="warning">
                不当内容
              </n-tag>
              <n-tag type="info">
                骚扰
              </n-tag>
            </n-space>
          </n-space>
        </n-tab-pane>

        <!-- 打赏功能 -->
        <n-tab-pane
          name="reward"
          tab="💰 打赏"
        >
          <n-space vertical>
            <n-alert
              type="success"
              title="打赏功能"
            >
              支持优质内容创作者，让好内容得到回报！
            </n-alert>
            <n-space>
              <n-statistic
                label="我的金币"
                :value="userCoins"
              >
                <template #suffix>
                  <n-icon><CashIcon /></n-icon>
                </template>
              </n-statistic>
            </n-space>
          </n-space>
        </n-tab-pane>

        <!-- 黑名单 -->
        <n-tab-pane
          name="blacklist"
          tab="🚫 黑名单"
        >
          <n-space vertical>
            <n-alert
              type="default"
              title="黑名单功能"
            >
              屏蔽不想看到的用户，打造专属浏览体验！
            </n-alert>
            <n-button @click="showBlacklist">
              管理黑名单 ({{ blacklistCount }})
            </n-button>
          </n-space>
        </n-tab-pane>

        <!-- 浏览历史 -->
        <n-tab-pane
          name="history"
          tab="📜 历史"
        >
          <n-space vertical>
            <n-alert
              type="info"
              title="浏览历史"
            >
              自动记录您的浏览足迹，轻松回顾精彩内容！
            </n-alert>
            <n-button @click="showHistory">
              查看浏览历史 ({{ historyCount }})
            </n-button>
          </n-space>
        </n-tab-pane>

        <!-- 热门搜索 -->
        <n-tab-pane
          name="search"
          tab="🔥 热搜"
        >
          <n-space vertical>
            <n-alert
              type="warning"
              title="热门搜索"
            >
              发现热门话题，紧跟社区潮流！
            </n-alert>
            <n-space>
              <n-tag
                v-for="(item, index) in hotSearches"
                :key="index"
                :type="getHotTagType(index)"
                round
              >
                {{ index + 1 }}. {{ item.keyword }} ({{ item.count }})
              </n-tag>
            </n-space>
          </n-space>
        </n-tab-pane>

        <!-- 投票功能 -->
        <n-tab-pane
          name="poll"
          tab="📊 投票"
        >
          <n-space vertical>
            <n-alert
              type="success"
              title="投票功能"
            >
              创建投票帖，收集大家的意见和想法！
            </n-alert>
            <n-button
              type="primary"
              @click="createPoll"
            >
              创建投票
            </n-button>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { db } from '@/utils/database'
import { Cash as CashIcon } from '@vicons/ionicons5'

const message = useMessage()
const userStore = useUserStore()

const drafts = ref<any[]>([])
const hotSearches = ref<Array<{ keyword: string; count: number }>>([])
const blacklistCount = ref(0)
const historyCount = ref(0)

const userCoins = computed(() => {
  return userStore.currentUser?.coins || 0
})

onMounted(() => {
  if (userStore.currentUser) {
    // 加载草稿
    drafts.value = db.getDrafts(userStore.currentUser.id)
    
    // 加载黑名单数量
    blacklistCount.value = userStore.currentUser.blacklist?.length || 0
    
    // 加载浏览历史数量
    historyCount.value = userStore.currentUser.viewHistory?.length || 0
  }
  
  // 加载热门搜索
  hotSearches.value = db.getHotSearches(5)
})

const showDrafts = () => {
  message.info('草稿箱功能：在发帖页面会自动保存草稿')
}

const showBlacklist = () => {
  message.info('黑名单功能：在用户主页可以添加/移除黑名单')
}

const showHistory = () => {
  message.info('浏览历史功能：在个人中心可以查看浏览历史')
}

const createPoll = () => {
  message.info('投票功能：在发帖页面可以创建投票帖')
}

const getHotTagType = (index: number) => {
  if (index === 0) return 'error'
  if (index === 1) return 'warning'
  if (index === 2) return 'info'
  return 'default'
}
</script>

<style scoped>
.feature-showcase {
  padding: 24px;
}

.showcase-card {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 107, 53, 0.3);
}
</style>


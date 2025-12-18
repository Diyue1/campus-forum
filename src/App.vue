<template>
  <!-- 赛博朋克装饰背景 -->
  <div class="cyberpunk-bg">
    <!-- 动态网格背景 -->
    <div class="cyber-grid" />
    
    <!-- 数据流装饰 -->
    <div class="data-streams-bg">
      <div
        v-for="i in 12"
        :key="i"
        class="data-stream"
        :style="{ left: (i * 8.33) + '%', animationDelay: (i * 0.3) + 's' }"
      />
    </div>
    
    <!-- 扫描线效果 -->
    <div class="scan-lines" />
    
    <!-- 霓虹线条装饰 -->
    <div class="neon-lines">
      <div class="neon-line neon-line-1" />
      <div class="neon-line neon-line-2" />
      <div class="neon-line neon-line-3" />
    </div>
    
    <!-- 故障效果覆盖 -->
    <div class="glitch-overlay" />
    
    <!-- 角落装饰 -->
    <div class="corner-decor corner-tl" />
    <div class="corner-decor corner-tr" />
    <div class="corner-decor corner-bl" />
    <div class="corner-decor corner-br" />
  </div>
  
  <n-config-provider
    :theme="theme"
    :theme-overrides="themeOverrides"
  >
    <n-global-style />
    <n-message-provider>
      <MessageInitializer />
      <n-dialog-provider>
        <n-notification-provider>
          <router-view />
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import {
  darkTheme,
  type GlobalThemeOverrides,
  NConfigProvider,
  NGlobalStyle,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  useMessage
} from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import { messageService } from '@/utils/message'

// 消息服务初始化组件
const MessageInitializer = defineComponent({
  name: 'MessageInitializer',
  setup() {
    const message = useMessage()
    messageService.init(message)
    return () => h('div', { style: { display: 'none' } })
  }
})

const themeStore = useThemeStore()

const theme = computed(() => themeStore.isDark ? darkTheme : null)

// 绝区零赛博朋克主题配置
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#00F0FF',
    primaryColorHover: '#33F3FF',
    primaryColorPressed: '#00D4E6',
    primaryColorSuppl: '#FF00FF',
    infoColor: '#00F0FF',
    successColor: '#00FF88',
    warningColor: '#FFFF00',
    errorColor: '#FF0066',
    textColorBase: '#FFFFFF',
    textColor1: '#FFFFFF',
    textColor2: 'rgba(255, 255, 255, 0.82)',
    textColor3: 'rgba(255, 255, 255, 0.52)',
    textColorDisabled: 'rgba(255, 255, 255, 0.38)',
    placeholderColor: 'rgba(255, 255, 255, 0.38)',
    iconColor: 'rgba(255, 255, 255, 0.82)',
    iconColorHover: '#FFFFFF',
    iconColorPressed: 'rgba(255, 255, 255, 0.82)',
    iconColorDisabled: 'rgba(255, 255, 255, 0.38)',
    opacity1: '0.82',
    opacity2: '0.72',
    opacity3: '0.38',
    opacity4: '0.24',
    opacity5: '0.18',
    dividerColor: 'rgba(255, 255, 255, 0.09)',
    borderColor: 'rgba(255, 255, 255, 0.24)',
    closeIconColor: 'rgba(255, 255, 255, 0.52)',
    closeIconColorHover: 'rgba(255, 255, 255, 0.82)',
    closeIconColorPressed: 'rgba(255, 255, 255, 0.82)',
    clearColor: 'rgba(255, 255, 255, 0.38)',
    clearColorHover: 'rgba(255, 255, 255, 0.52)',
    clearColorPressed: 'rgba(255, 255, 255, 0.52)',
    scrollbarColor: 'rgba(255, 255, 255, 0.2)',
    scrollbarColorHover: 'rgba(255, 255, 255, 0.3)',
    scrollbarWidth: '5px',
    scrollbarHeight: '5px',
    scrollbarBorderRadius: '5px',
    progressRailColor: 'rgba(255, 255, 255, 0.12)',
    railColor: 'rgba(255, 255, 255, 0.12)',
    popoverColor: '#0A0A14',
    tableColor: '#0A0A14',
    cardColor: '#0A0A14',
    modalColor: '#0A0A14',
    bodyColor: '#000000',
    tagColor: '#0A0A14',
    avatarColor: 'rgba(255, 255, 255, 0.18)',
    invertedColor: '#101014',
    inputColor: 'rgba(255, 255, 255, 0.1)',
    codeColor: 'rgba(255, 255, 255, 0.12)',
    tabColor: 'rgba(255, 255, 255, 0.04)',
    actionColor: 'rgba(255, 255, 255, 0.06)',
    tableHeaderColor: 'rgba(255, 255, 255, 0.06)',
    hoverColor: 'rgba(255, 255, 255, 0.09)',
    tableColorHover: 'rgba(255, 255, 255, 0.06)',
    tableColorStriped: 'rgba(255, 255, 255, 0.05)',
    pressedColor: 'rgba(255, 255, 255, 0.05)',
    opacityDisabled: '0.38',
    inputColorDisabled: 'rgba(255, 255, 255, 0.06)',
    buttonColor2: 'rgba(255, 255, 255, 0.08)',
    buttonColor2Hover: 'rgba(255, 255, 255, 0.12)',
    buttonColor2Pressed: 'rgba(255, 255, 255, 0.08)',
    boxShadow1: '0 1px 2px -2px rgba(0, 0, 0, .08), 0 3px 6px 0 rgba(0, 0, 0, .06), 0 5px 12px 4px rgba(0, 0, 0, .04)',
    boxShadow2: '0 3px 6px -4px rgba(0, 0, 0, .12), 0 6px 16px 0 rgba(0, 0, 0, .08), 0 9px 28px 8px rgba(0, 0, 0, .05)',
    boxShadow3: '0 6px 16px -9px rgba(0, 0, 0, .08), 0 9px 28px 0 rgba(0, 0, 0, .05), 0 12px 48px 16px rgba(0, 0, 0, .03)'
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: var(--interknot-font-family);
  background: #000000;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

/* 绝区零赛博朋克滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 240, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #00F0FF 0%, #FF00FF 100%);
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #FF00FF, #FFFF00);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.8);
}

/* 赛博朋克装饰背景 */
.cyberpunk-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* 动态网格背景 */
.cyber-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(0deg, transparent 24%, rgba(0, 240, 255, 0.08) 25%, rgba(0, 240, 255, 0.08) 26%, transparent 27%, transparent 74%, rgba(0, 240, 255, 0.08) 75%, rgba(0, 240, 255, 0.08) 76%, transparent 77%, transparent),
    linear-gradient(90deg, transparent 24%, rgba(0, 240, 255, 0.08) 25%, rgba(0, 240, 255, 0.08) 26%, transparent 27%, transparent 74%, rgba(0, 240, 255, 0.08) 75%, rgba(0, 240, 255, 0.08) 76%, transparent 77%, transparent);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* 数据流装饰 */
.data-streams-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.data-stream {
  position: absolute;
  top: -100px;
  width: 2px;
  height: 100px;
  background: linear-gradient(180deg, transparent, #00F0FF, transparent);
  animation: data-fall 4s linear infinite;
  opacity: 0.6;
  box-shadow: 0 0 10px #00F0FF;
}

@keyframes data-fall {
  0% {
    top: -100px;
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    top: 100vh;
    opacity: 0;
  }
}

/* 扫描线效果 */
.scan-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 240, 255, 0.03) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 240, 255, 0.03) 3px
  );
  animation: scan-move 0.1s infinite;
}

@keyframes scan-move {
  0% { transform: translateY(0); }
  100% { transform: translateY(3px); }
}

/* 霓虹线条装饰 */
.neon-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.neon-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, #00F0FF, #FF00FF, transparent);
  box-shadow: 0 0 10px #00F0FF, 0 0 20px #FF00FF;
}

.neon-line-1 {
  top: 20%;
  left: 0;
  width: 100%;
  height: 1px;
  animation: neon-pulse 3s ease-in-out infinite;
}

.neon-line-2 {
  top: 60%;
  left: 0;
  width: 100%;
  height: 1px;
  animation: neon-pulse 3s ease-in-out infinite 1s;
}

.neon-line-3 {
  top: 0;
  left: 50%;
  width: 1px;
  height: 100%;
  animation: neon-pulse 3s ease-in-out infinite 2s;
}

@keyframes neon-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.6; }
}

/* 故障效果覆盖 */
.glitch-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 240, 255, 0.02) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 240, 255, 0.02) 3px
  );
  animation: glitch-shift 0.1s infinite;
}

@keyframes glitch-shift {
  0% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  50% { transform: translateX(2px); }
  75% { transform: translateX(-1px); }
  100% { transform: translateX(0); }
}

/* 角落装饰 */
.corner-decor {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
}

.corner-tl {
  top: 20px;
  left: 20px;
  border-right: none;
  border-bottom: none;
  animation: corner-glow 2s ease-in-out infinite;
}

.corner-tr {
  top: 20px;
  right: 20px;
  border-left: none;
  border-bottom: none;
  animation: corner-glow 2s ease-in-out infinite 0.5s;
}

.corner-bl {
  bottom: 20px;
  left: 20px;
  border-right: none;
  border-top: none;
  animation: corner-glow 2s ease-in-out infinite 1s;
}

.corner-br {
  bottom: 20px;
  right: 20px;
  border-left: none;
  border-top: none;
  animation: corner-glow 2s ease-in-out infinite 1.5s;
}

@keyframes corner-glow {
  0%, 100% {
    border-color: rgba(0, 240, 255, 0.3);
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
  }
  50% {
    border-color: rgba(0, 240, 255, 0.8);
    box-shadow: 0 0 40px rgba(0, 240, 255, 0.5);
  }
}

.zzz-hologram-logo::before {
  content: '校园集市';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 52px;
  font-weight: 900;
  color: #00F0FF;
  text-shadow: 
    0 0 5px #00F0FF,
    0 0 10px #00F0FF,
    0 0 20px #00F0FF,
    0 0 40px #00F0FF,
    0 0 80px #FF00FF,
    0 0 120px #FF00FF;
  animation: dynamic-glow 2s ease-in-out infinite, text-glitch 3s infinite;
  letter-spacing: 8px;
}

@keyframes dynamic-glow {
  0%, 100% {
    text-shadow: 
      0 0 5px #00F0FF,
      0 0 10px #00F0FF,
      0 0 20px #00F0FF,
      0 0 40px #00F0FF,
      0 0 80px #FF00FF;
    opacity: 1;
  }
  50% {
    text-shadow: 
      0 0 10px #00F0FF,
      0 0 20px #00F0FF,
      0 0 40px #00F0FF,
      0 0 80px #00F0FF,
      0 0 120px #FF00FF,
      0 0 160px #FF00FF;
    opacity: 0.9;
  }
}

@keyframes text-glitch {
  0%, 90%, 100% {
    transform: translate(-50%, -50%);
  }
  92% {
    transform: translate(-48%, -50%);
  }
  94% {
    transform: translate(-52%, -50%);
  }
  96% {
    transform: translate(-50%, -48%);
  }
  98% {
    transform: translate(-50%, -52%);
  }
}

</style>


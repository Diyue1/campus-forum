<template>
  <div class="campus-3d-view">
    <!-- 加载动画 - 动森风格 -->
    <transition name="fade-out">
      <div
        v-if="isLoading"
        class="loading-screen"
      >
        <div class="loading-content">
          <!-- 可爱的加载图标 -->
          <div class="loading-icon">
            <div class="leaf leaf-1">
              🍃
            </div>
            <div class="leaf leaf-2">
              🍃
            </div>
            <div class="leaf leaf-3">
              🍃
            </div>
            <div class="island">
              🏝️
            </div>
          </div>
          
          <!-- 加载文字 -->
          <div class="loading-text">
            <h2>{{ loadingTexts[currentLoadingTextIndex] }}</h2>
            <div class="loading-bar">
              <div
                class="loading-progress"
                :style="{ width: loadingProgress + '%' }"
              />
            </div>
            <p class="loading-tip">
              {{ loadingProgress }}%
            </p>
          </div>
          
          <!-- 装饰元素 -->
          <div class="loading-decorations">
            <span class="deco">🌸</span>
            <span class="deco">🦋</span>
            <span class="deco">🌺</span>
            <span class="deco">🌼</span>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 3D Canvas -->
    <canvas
      ref="canvasRef"
      class="three-canvas"
    />

    <!-- UI 覆盖层 -->
    <div class="ui-overlay">
      <!-- 控制提示 -->
      <div class="controls-hint">
        <div class="hint-item">
          <span class="key">W A S D</span>
          <span class="desc">移动</span>
        </div>
        <div class="hint-item">
          <span class="key">E</span>
          <span class="desc">交互</span>
        </div>
      </div>

      <!-- 交互提示 -->
      <transition name="fade">
        <div
          v-if="currentZone"
          class="interaction-prompt"
        >
          <div class="prompt-icon">
            {{ currentZone.icon }}
          </div>
          <div class="prompt-text">
            <div class="prompt-title">
              {{ currentZone.name }}
            </div>
            <div class="prompt-action">
              按 E 键交互
            </div>
          </div>
        </div>
      </transition>

      <!-- 小地图 -->
      <div class="minimap">
        <div class="minimap-content">
          <div
            class="minimap-character"
            :style="{
              left: `${(characterPos.x / 50) * 100 + 50}%`,
              top: `${(characterPos.z / 50) * 100 + 50}%`
            }"
          />
          <div
            v-for="zone in zones"
            :key="zone.id"
            class="minimap-zone"
            :class="{ active: currentZone?.id === zone.id }"
            :style="{
              left: `${(zone.position.x / 50) * 100 + 50}%`,
              top: `${(zone.position.z / 50) * 100 + 50}%`
            }"
          />
        </div>
      </div>

      <!-- 昼夜切换 -->
      <div class="time-control">
        <n-space
          vertical
          size="small"
        >
          <n-button-group>
            <n-button
              :type="timeOfDay === 'day' ? 'primary' : 'default'"
              size="small"
              @click="setTimeOfDay('day')"
            >
              ☀️ 白天
            </n-button>
            <n-button
              :type="timeOfDay === 'night' ? 'primary' : 'default'"
              size="small"
              @click="setTimeOfDay('night')"
            >
              🌙 夜晚
            </n-button>
          </n-button-group>

          <n-button
            type="info"
            size="small"
            @click="toggleRain"
          >
            {{ isRaining ? '🌧️ 停雨' : '☁️ 下雨' }}
          </n-button>
        </n-space>
      </div>
    </div>
    
    <!-- 退出按钮 -->
    <div class="exit-button">
      <n-button
        type="primary"
        size="large"
        circle
        @click="handleExit"
      >
        <template #icon>
          <n-icon><CloseIcon /></n-icon>
        </template>
      </n-button>
    </div>

    <!-- 帮助按钮 -->
    <div class="help-button">
      <n-button
        type="info"
        size="large"
        circle
        @click="showHelp = true"
      >
        <template #icon>
          <n-icon><HelpIcon /></n-icon>
        </template>
      </n-button>
    </div>

    <!-- 帮助对话框 -->
    <n-modal
      v-model:show="showHelp"
      preset="card"
      title="3D 校园导航帮助"
      style="max-width: 600px"
    >
      <div class="help-content">
        <h3>🎮 控制说明</h3>
        <ul>
          <li><strong>W / ↑</strong> - 向前移动</li>
          <li><strong>S / ↓</strong> - 向后移动</li>
          <li><strong>A / ←</strong> - 向左移动</li>
          <li><strong>D / →</strong> - 向右移动</li>
          <li><strong>E</strong> - 与交互区域互动</li>
        </ul>

        <h3>📍 交互区域</h3>
        <ul>
          <li><strong>📝 帖子广场</strong> - 浏览和查看所有帖子</li>
          <li><strong>✍️ 创作中心</strong> - 发布新帖子</li>
          <li><strong>💬 消息中心</strong> - 查看私信和通知</li>
          <li><strong>👤 个人中心</strong> - 管理个人资料</li>
        </ul>

        <h3>💡 提示</h3>
        <ul>
          <li>靠近蓝色圆圈区域时会显示提示信息</li>
          <li>按 E 键可以快速进入对应功能</li>
          <li>右上角的小地图可以帮助你定位</li>
          <li>移动时角色会播放行走动画</li>
          <li>探索校园，发现教学楼、图书馆、体育馆等建筑</li>
        </ul>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Close as CloseIcon, Help as HelpIcon } from '@vicons/ionicons5'
import * as THREE from 'three'
import { messageService } from '@/utils/message'

const router = useRouter()
const canvasRef = ref<HTMLCanvasElement>()
const currentZone = ref<any>(null)
const characterPos = ref({ x: 0, z: 0 })
const showHelp = ref(false)
const timeOfDay = ref<'day' | 'night'>('day')
const isRaining = ref(false)
const isLoading = ref(true)
const loadingProgress = ref(0)
const currentLoadingTextIndex = ref(0)

const loadingTexts = [
  '正在种植树木... 🌳',
  '正在布置花坛... 🌸',
  '正在召唤小动物... 🐱',
  '正在建造小屋... 🏠',
  '正在放飞蝴蝶... 🦋',
  '准备就绪！✨'
]

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let character: THREE.Group
let animationId: number
let walkCycle = 0
let isWalking = false
let sunLight: THREE.DirectionalLight
let ambientLight: THREE.AmbientLight
let hemiLight: THREE.HemisphereLight
let skyMaterial: THREE.ShaderMaterial
let butterflies: THREE.Group[] = []
let birds: THREE.Group[] = []
let rainParticles: THREE.Points | null = null

// 交互区域
const zones = [
  { id: 'posts', name: '帖子广场', position: { x: 5, z: 5 }, icon: '📝', route: '/' },
  { id: 'create', name: '创作中心', position: { x: -5, z: 5 }, icon: '✍️', route: '/create' },
  { id: 'messages', name: '消息中心', position: { x: 5, z: -5 }, icon: '💬', route: '/messages' },
  { id: 'profile', name: '个人中心', position: { x: -5, z: -5 }, icon: '👤', route: '/profile' }
]

// 键盘状态
const keys = new Set<string>()

onMounted(() => {
  // 启动加载动画
  startLoading()
})

function startLoading() {
  let progress = 0
  let textIndex = 0
  
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 15 + 5
    
    if (progress >= 100) {
      progress = 100
      loadingProgress.value = 100
      currentLoadingTextIndex.value = loadingTexts.length - 1
      
      setTimeout(() => {
        isLoading.value = false
        clearInterval(loadingInterval)
        
        // 加载完成后初始化3D场景
        initThree()
        setupControls()
        animate()
        
        // 首次访问显示帮助
        const hasVisited = localStorage.getItem('campus_3d_visited')
        if (!hasVisited) {
          setTimeout(() => {
            showHelp.value = true
            localStorage.setItem('campus_3d_visited', 'true')
          }, 1000)
        }
      }, 500)
    } else {
      loadingProgress.value = Math.min(progress, 100)
      
      // 更新加载文字
      const newTextIndex = Math.floor((progress / 100) * (loadingTexts.length - 1))
      if (newTextIndex !== textIndex) {
        textIndex = newTextIndex
        currentLoadingTextIndex.value = textIndex
      }
    }
  }, 300)
}

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  if (renderer) renderer.dispose()
})

function initThree() {
  if (!canvasRef.value) return

  // 场景
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0xb8d4e8, 50, 150)

  // 天空盒 - 更真实的天空渐变
  const skyGeometry = new THREE.SphereGeometry(500, 32, 32)
  skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x4a90e2) },
      bottomColor: { value: new THREE.Color(0xe8f4f8) },
      offset: { value: 33 },
      exponent: { value: 0.8 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide
  })
  const sky = new THREE.Mesh(skyGeometry, skyMaterial)
  scene.add(sky)

  // 相机 - 更自然的视角
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 8, 12)
  camera.lookAt(0, 1, 0) // 稍微向下看，更符合人眼视角

  // 渲染器（增强配置）
  renderer = new THREE.WebGLRenderer({ 
    canvas: canvasRef.value, 
    antialias: true,
    powerPreference: 'high-performance',
    stencil: false,
    depth: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // 限制像素比以提升性能
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.outputColorSpace = THREE.SRGBColorSpace

  // 太阳光 - 更柔和的光照
  sunLight = new THREE.DirectionalLight(0xfff5e6, 1.8)
  sunLight.position.set(50, 60, 30)
  sunLight.castShadow = true
  sunLight.shadow.camera.left = -50
  sunLight.shadow.camera.right = 50
  sunLight.shadow.camera.top = 50
  sunLight.shadow.camera.bottom = -50
  sunLight.shadow.mapSize.width = 4096
  sunLight.shadow.mapSize.height = 4096
  sunLight.shadow.bias = -0.0001
  sunLight.shadow.radius = 3
  scene.add(sunLight)

  // 环境光 - 更自然的环境照明
  ambientLight = new THREE.AmbientLight(0xb8d4e8, 0.7)
  scene.add(ambientLight)

  // 半球光（天空和地面）- 更真实的天地光
  hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x6b8e5a, 0.6)
  scene.add(hemiLight)

  // 地面（草地）- 更真实的草地
  const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50)
  // 创建更真实的草地材质
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b9d5a,
    roughness: 0.98,
    metalness: 0.0,
    flatShading: false
  })
  
  // 添加顶点颜色创建更真实的草地纹理
  const colors = []
  const positions = groundGeometry.attributes.position.array
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const z = positions[i + 2]
    const distance = Math.sqrt(x * x + z * z)
    
    // 创建随机草地颜色变化（模拟不同草地区域）
    const noise = (Math.sin(x * 0.3) * Math.cos(z * 0.3) + 1) * 0.08
    const distanceFactor = Math.min(1, distance / 50)
    
    // 更自然的草地色彩
    const r = 0.35 + noise + distanceFactor * 0.1
    const g = 0.55 + noise * 0.3 + distanceFactor * 0.05
    const b = 0.28 + noise * 0.2 + distanceFactor * 0.08
    
    colors.push(r, g, b)
  }
  groundGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  groundMaterial.vertexColors = true
  
  // 添加轻微的高度变化（模拟草地起伏）
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const z = positions[i + 2]
    // 轻微的高度变化，模拟真实草地
    positions[i + 1] = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.05
  }
  groundGeometry.computeVertexNormals()
  
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 道路 - 美化版（带纹理感）
  const roadGeometry = new THREE.PlaneGeometry(4, 100, 1, 20)
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: false
  })
  
  // 添加道路纹理感（通过顶点颜色）
  const roadColors = []
  const roadPositions = roadGeometry.attributes.position.array
  for (let i = 0; i < roadPositions.length; i += 3) {
    const noise = Math.random() * 0.1
    roadColors.push(0.2 + noise, 0.2 + noise, 0.2 + noise)
  }
  roadGeometry.setAttribute('color', new THREE.Float32BufferAttribute(roadColors, 3))
  roadMaterial.vertexColors = true

  // 十字路口
  const roadH = new THREE.Mesh(roadGeometry, roadMaterial)
  roadH.rotation.x = -Math.PI / 2
  roadH.position.y = 0.01
  roadH.receiveShadow = true
  scene.add(roadH)

  const roadV = new THREE.Mesh(roadGeometry, roadMaterial)
  roadV.rotation.x = -Math.PI / 2
  roadV.rotation.z = Math.PI / 2
  roadV.position.y = 0.01
  roadV.receiveShadow = true
  scene.add(roadV)

  // 道路标线 - 美化版（虚线效果）
  const lineGeometry = new THREE.PlaneGeometry(0.15, 100)
  const lineMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffeb3b,
    emissive: 0xffeb3b,
    emissiveIntensity: 0.3,
    roughness: 0.3,
    metalness: 0.7
  })
  const centerLine = new THREE.Mesh(lineGeometry, lineMaterial)
  centerLine.rotation.x = -Math.PI / 2
  centerLine.position.y = 0.02
  scene.add(centerLine)
  
  // 添加道路边缘线
  const edgeLineGeometry = new THREE.PlaneGeometry(0.1, 100)
  const edgeLineMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.2
  })
  
  const leftEdge = new THREE.Mesh(edgeLineGeometry, edgeLineMaterial)
  leftEdge.rotation.x = -Math.PI / 2
  leftEdge.position.set(-2, 0.02, 0)
  scene.add(leftEdge)
  
  const rightEdge = new THREE.Mesh(edgeLineGeometry, edgeLineMaterial)
  rightEdge.rotation.x = -Math.PI / 2
  rightEdge.position.set(2, 0.02, 0)
  scene.add(rightEdge)

  // 角色 - 动物森友会风格（Q版可爱）
  character = new THREE.Group()

  // 大头部 - Q版比例
  const headGeometry = new THREE.SphereGeometry(0.4, 20, 20)
  const headMaterial = new THREE.MeshToonMaterial({ 
    color: 0xffdab9,
    gradientMap: null
  })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.y = 1.1
  head.castShadow = true
  character.add(head)
  
  // 可爱发型 - 动森风格
  const hairGeometry = new THREE.SphereGeometry(0.42, 16, 16)
  const hairMaterial = new THREE.MeshToonMaterial({ 
    color: 0x8b6f47,
    gradientMap: null
  })
  const hair = new THREE.Mesh(hairGeometry, hairMaterial)
  hair.position.set(0, 1.2, -0.05)
  hair.scale.set(1, 0.8, 1.1)
  hair.castShadow = true
  character.add(hair)
  
  // 刘海
  const bangs = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 12, 12),
    hairMaterial
  )
  bangs.position.set(0, 1.25, 0.3)
  bangs.scale.set(1.2, 0.6, 0.8)
  character.add(bangs)
  
  // 大眼睛 - 动森特色
  const eyeWhiteGeometry = new THREE.SphereGeometry(0.08, 12, 12)
  const eyeWhiteMaterial = new THREE.MeshToonMaterial({ color: 0xffffff })
  
  const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial)
  leftEyeWhite.position.set(-0.12, 1.15, 0.35)
  leftEyeWhite.scale.set(1, 1.2, 0.5)
  character.add(leftEyeWhite)
  
  const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial)
  rightEyeWhite.position.set(0.12, 1.15, 0.35)
  rightEyeWhite.scale.set(1, 1.2, 0.5)
  character.add(rightEyeWhite)
  
  // 瞳孔
  const pupilGeometry = new THREE.SphereGeometry(0.045, 12, 12)
  const pupilMaterial = new THREE.MeshToonMaterial({ color: 0x3d2817 })
  
  const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial)
  leftPupil.position.set(-0.12, 1.15, 0.38)
  character.add(leftPupil)
  
  const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial)
  rightPupil.position.set(0.12, 1.15, 0.38)
  character.add(rightPupil)
  
  // 高光 - 让眼睛更有神
  const shineGeometry = new THREE.SphereGeometry(0.025, 8, 8)
  const shineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  
  const leftShine = new THREE.Mesh(shineGeometry, shineMaterial)
  leftShine.position.set(-0.1, 1.18, 0.4)
  character.add(leftShine)
  
  const rightShine = new THREE.Mesh(shineGeometry, shineMaterial)
  rightShine.position.set(0.14, 1.18, 0.4)
  character.add(rightShine)
  
  // 腮红
  const blushGeometry = new THREE.SphereGeometry(0.08, 12, 12)
  const blushMaterial = new THREE.MeshToonMaterial({ 
    color: 0xffb6c1,
    transparent: true,
    opacity: 0.6
  })
  
  const leftBlush = new THREE.Mesh(blushGeometry, blushMaterial)
  leftBlush.position.set(-0.25, 1.05, 0.3)
  leftBlush.scale.set(1, 0.6, 0.3)
  character.add(leftBlush)
  
  const rightBlush = new THREE.Mesh(blushGeometry, blushMaterial)
  rightBlush.position.set(0.25, 1.05, 0.3)
  rightBlush.scale.set(1, 0.6, 0.3)
  character.add(rightBlush)
  
  // 可爱小鼻子
  const noseGeometry = new THREE.SphereGeometry(0.03, 8, 8)
  const noseMaterial = new THREE.MeshToonMaterial({ color: 0xffb6c1 })
  const nose = new THREE.Mesh(noseGeometry, noseMaterial)
  nose.position.set(0, 1.05, 0.39)
  character.add(nose)
  
  // 微笑嘴巴
  const smileGeometry = new THREE.TorusGeometry(0.1, 0.02, 8, 16, Math.PI)
  const smileMaterial = new THREE.MeshToonMaterial({ color: 0xff6b9d })
  const smile = new THREE.Mesh(smileGeometry, smileMaterial)
  smile.position.set(0, 0.95, 0.37)
  smile.rotation.x = Math.PI / 2
  smile.rotation.z = Math.PI
  character.add(smile)

  // Q版身体 - 圆润可爱
  const torsoGeometry = new THREE.SphereGeometry(0.28, 16, 16)
  const torsoMaterial = new THREE.MeshToonMaterial({ 
    color: 0x87ceeb,
    gradientMap: null
  })
  const torso = new THREE.Mesh(torsoGeometry, torsoMaterial)
  torso.position.y = 0.55
  torso.scale.set(1, 1.3, 1)
  torso.castShadow = true
  character.add(torso)
  
  // 可爱小背包
  const backpackGeometry = new THREE.BoxGeometry(0.25, 0.3, 0.15)
  const backpackMaterial = new THREE.MeshToonMaterial({ 
    color: 0xffd700,
    gradientMap: null
  })
  const backpack = new THREE.Mesh(backpackGeometry, backpackMaterial)
  backpack.position.set(0, 0.6, -0.3)
  backpack.castShadow = true
  character.add(backpack)
  
  // 背包扣子装饰
  const buttonGeometry = new THREE.SphereGeometry(0.03, 8, 8)
  const buttonMaterial = new THREE.MeshToonMaterial({ color: 0xff6b6b })
  const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial)
  button1.position.set(0, 0.7, -0.22)
  character.add(button1)
  const button2 = new THREE.Mesh(buttonGeometry, buttonMaterial)
  button2.position.set(0, 0.5, -0.22)
  character.add(button2)

  // 短小可爱的手臂
  const armGeometry = new THREE.CapsuleGeometry(0.08, 0.35, 8, 12)
  const armMaterial = new THREE.MeshToonMaterial({ 
    color: 0x87ceeb,
    gradientMap: null
  })
  
  const leftUpperArm = new THREE.Mesh(armGeometry, armMaterial)
  leftUpperArm.position.set(-0.35, 0.65, 0)
  leftUpperArm.rotation.z = 0.4
  leftUpperArm.castShadow = true
  character.add(leftUpperArm)
  
  const rightUpperArm = new THREE.Mesh(armGeometry, armMaterial)
  rightUpperArm.position.set(0.35, 0.65, 0)
  rightUpperArm.rotation.z = -0.4
  rightUpperArm.castShadow = true
  character.add(rightUpperArm)
  
  // 圆圆的小手
  const handGeometry = new THREE.SphereGeometry(0.1, 12, 12)
  const handMaterial = new THREE.MeshToonMaterial({ 
    color: 0xffdab9,
    gradientMap: null
  })
  
  const leftForearm = new THREE.Mesh(handGeometry, handMaterial)
  leftForearm.position.set(-0.48, 0.42, 0)
  leftForearm.castShadow = true
  character.add(leftForearm)
  
  const rightForearm = new THREE.Mesh(handGeometry, handMaterial)
  rightForearm.position.set(0.48, 0.42, 0)
  rightForearm.castShadow = true
  character.add(rightForearm)

  // 短短的腿 - Q版比例
  const legGeometry = new THREE.CapsuleGeometry(0.09, 0.3, 8, 12)
  const legMaterial = new THREE.MeshToonMaterial({ 
    color: 0xffa07a,
    gradientMap: null
  })
  
  const leftThigh = new THREE.Mesh(legGeometry, legMaterial)
  leftThigh.position.set(-0.15, 0.1, 0)
  leftThigh.castShadow = true
  character.add(leftThigh)
  
  const rightThigh = new THREE.Mesh(legGeometry, legMaterial)
  rightThigh.position.set(0.15, 0.1, 0)
  rightThigh.castShadow = true
  character.add(rightThigh)
  
  // 可爱圆鞋子
  const shoeGeometry = new THREE.SphereGeometry(0.12, 12, 12)
  const shoeMaterial = new THREE.MeshToonMaterial({ 
    color: 0xff6b6b,
    gradientMap: null
  })
  
  const leftShin = new THREE.Mesh(shoeGeometry, shoeMaterial)
  leftShin.position.set(-0.15, -0.08, 0.05)
  leftShin.scale.set(1, 0.7, 1.3)
  leftShin.castShadow = true
  character.add(leftShin)
  
  const rightShin = new THREE.Mesh(shoeGeometry, shoeMaterial)
  rightShin.position.set(0.15, -0.08, 0.05)
  rightShin.scale.set(1, 0.7, 1.3)
  rightShin.castShadow = true
  character.add(rightShin)
  
  // 鞋子装饰（白色鞋带区域）
  const shoeLaceGeometry = new THREE.SphereGeometry(0.06, 8, 8)
  const shoeLaceMaterial = new THREE.MeshToonMaterial({ color: 0xffffff })
  
  const leftFoot = new THREE.Mesh(shoeLaceGeometry, shoeLaceMaterial)
  leftFoot.position.set(-0.15, -0.05, 0.15)
  leftFoot.scale.set(0.8, 0.5, 0.6)
  character.add(leftFoot)
  
  const rightFoot = new THREE.Mesh(shoeLaceGeometry, shoeLaceMaterial)
  rightFoot.position.set(0.15, -0.05, 0.15)
  rightFoot.scale.set(0.8, 0.5, 0.6)
  character.add(rightFoot)

  // 保存身体部位引用以便动画
  ;(character as any).bodyParts = {
    leftUpperArm,
    rightUpperArm,
    leftForearm,
    rightForearm,
    leftThigh,
    rightThigh,
    leftShin,
    rightShin
  }

  // 设置角色初始位置（避开中央喷泉和建筑物）
  character.position.set(6, 0, 6)
  scene.add(character)

  // 建筑物
  createBuildings()

  // 环境装饰
  createEnvironment()
  
  // 添加NPC角色
  createNPCs()
  
  // 添加更多场景细节
  addSceneDetails()

  // 交互区域标记 - 美化版（带动画效果）
  zones.forEach((zone, index) => {
    // 外圈光晕
    const outerGeometry = new THREE.RingGeometry(1.8, 2.2, 32)
    const outerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x6a9f5a, 
      transparent: true, 
      opacity: 0.3,
      emissive: 0x6a9f5a,
      emissiveIntensity: 0.15,
      side: THREE.DoubleSide
    })
    const outerCircle = new THREE.Mesh(outerGeometry, outerMaterial)
    outerCircle.rotation.x = -Math.PI / 2
    outerCircle.position.set(zone.position.x, 0.01, zone.position.z)
    scene.add(outerCircle)
    
    // 内圈
    const geometry = new THREE.CircleGeometry(1.5, 32)
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x6a9f5a, 
      transparent: true, 
      opacity: 0.4,
      emissive: 0x6a9f5a,
      emissiveIntensity: 0.25,
      side: THREE.DoubleSide
    })
    const circle = new THREE.Mesh(geometry, material)
    circle.rotation.x = -Math.PI / 2
    circle.position.set(zone.position.x, 0.01, zone.position.z)
    scene.add(circle)

    // 标记柱 - 更精致
    const pillarGeometry = new THREE.CylinderGeometry(0.12, 0.15, 2.5, 16)
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x6a9f5a,
      emissive: 0x6a9f5a,
      emissiveIntensity: 0.3,
      roughness: 0.4,
      metalness: 0.5
    })
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial)
    pillar.position.set(zone.position.x, 1.25, zone.position.z)
    pillar.castShadow = true
    scene.add(pillar)

    // 顶部标记 - 带图标效果
    const topGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.15)
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0x6a9f5a,
      emissive: 0x6a9f5a,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.6
    })
    const top = new THREE.Mesh(topGeometry, topMaterial)
    top.position.set(zone.position.x, 2.9, zone.position.z)
    top.castShadow = true
    scene.add(top)
    
    // 添加粒子效果（光点）
    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = 20
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i += 3) {
      const angle = (i / 3) * (Math.PI * 2 / particleCount)
      const radius = 1.8
      positions[i] = zone.position.x + Math.cos(angle) * radius
      positions[i + 1] = 0.5 + Math.random() * 2
      positions[i + 2] = zone.position.z + Math.sin(angle) * radius
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x6a9f5a,
      size: 0.1,
      transparent: true,
      opacity: 0.5
    })
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)
    
    // 保存引用以便动画
    ;(zone as any).particles = particles
    ;(zone as any).outerCircle = outerCircle
  })

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })
  
  // 初始化碰撞检测（延迟执行确保所有物体都已创建）
  console.log('[调试] 准备初始化碰撞检测')
  setTimeout(() => {
    console.log('[调试] setTimeout 回调执行')
    initCollisionObjects()
  }, 200)
}

function createBuildings() {
  // 教学楼 1 - 动森风格小屋
  const building1 = new THREE.Group()
  
  // 主体 - 温馨粉色
  const b1Body = new THREE.Mesh(
    new THREE.BoxGeometry(5, 4, 6),
    new THREE.MeshToonMaterial({
      color: 0xffd4e5,
      gradientMap: null
    })
  )
  b1Body.position.y = 2
  b1Body.castShadow = true
  b1Body.receiveShadow = true
  building1.add(b1Body)
  
  // 可爱的窗户
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const windowFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.1),
        new THREE.MeshToonMaterial({ color: 0x8b6f47 })
      )
      windowFrame.position.set(-1.2 + i * 2.4, 1.5 + j * 1.5, 3.05)
      building1.add(windowFrame)
      
      const windowGlass = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.7, 0.05),
        new THREE.MeshToonMaterial({ 
          color: 0x87ceeb,
          transparent: true,
          opacity: 0.6
        })
      )
      windowGlass.position.set(-1.2 + i * 2.4, 1.5 + j * 1.5, 3.08)
      building1.add(windowGlass)
      
      // 窗框十字
      const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.05, 0.05),
        new THREE.MeshToonMaterial({ color: 0x8b6f47 })
      )
      crossH.position.set(-1.2 + i * 2.4, 1.5 + j * 1.5, 3.1)
      building1.add(crossH)
      
      const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.7, 0.05),
        new THREE.MeshToonMaterial({ color: 0x8b6f47 })
      )
      crossV.position.set(-1.2 + i * 2.4, 1.5 + j * 1.5, 3.1)
      building1.add(crossV)
    }
  }
  
  // 可爱的门
  const buildingDoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2, 0.15),
    new THREE.MeshToonMaterial({ color: 0xff6b6b })
  )
  buildingDoor.position.set(0, 1, 3.05)
  building1.add(buildingDoor)
  
  // 门把手
  const doorKnob = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 12),
    new THREE.MeshToonMaterial({ color: 0xffd700 })
  )
  doorKnob.position.set(0.4, 1, 3.15)
  building1.add(doorKnob)

  // 圆润的屋顶 - 动森特色
  const b1Roof = new THREE.Mesh(
    new THREE.ConeGeometry(4, 2.5, 4),
    new THREE.MeshToonMaterial({ color: 0xff6b9d })
  )
  b1Roof.position.y = 5.25
  b1Roof.rotation.y = Math.PI / 4
  b1Roof.castShadow = true
  building1.add(b1Roof)
  
  // 烟囱装饰
  const chimney = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.3, 1.5, 8),
    new THREE.MeshToonMaterial({ color: 0x8b6f47 })
  )
  chimney.position.set(1.5, 5, -1.5)
  chimney.castShadow = true
  building1.add(chimney)
  
  const chimneyTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.3, 0.3, 8),
    new THREE.MeshToonMaterial({ color: 0x654321 })
  )
  chimneyTop.position.set(1.5, 5.9, -1.5)
  building1.add(chimneyTop)

  building1.position.set(10, 0, 10)
  scene.add(building1)

  // 教学楼 2 - 相同设计
  const building2 = building1.clone()
  building2.position.set(-10, 0, 10)
  scene.add(building2)

  // 图书馆 - 动森风格
  const library = new THREE.Group()
  
  // 主体 - 温馨黄色
  const libBody = new THREE.Mesh(
    new THREE.BoxGeometry(6, 5, 5),
    new THREE.MeshToonMaterial({ color: 0xfff4e0 })
  )
  libBody.position.y = 2.5
  libBody.castShadow = true
  libBody.receiveShadow = true
  library.add(libBody)
  
  // 大窗户
  for (let i = 0; i < 3; i++) {
    const bigWindow = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2, 0.1),
      new THREE.MeshToonMaterial({ 
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.6
      })
    )
    bigWindow.position.set(-2.5 + i * 2.5, 2.5, 2.55)
    library.add(bigWindow)
    
    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.1, 0.15),
      new THREE.MeshToonMaterial({ color: 0x8b6f47 })
    )
    windowFrame.position.set(-2.5 + i * 2.5, 2.5, 2.5)
    library.add(windowFrame)
  }
  
  // 可爱的门
  const libDoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 2.5, 0.15),
    new THREE.MeshToonMaterial({ color: 0x8b6f47 })
  )
  libDoor.position.set(0, 1.25, 2.55)
  library.add(libDoor)

  // 圆锥形屋顶
  const libRoof = new THREE.Mesh(
    new THREE.ConeGeometry(4.5, 3, 6),
    new THREE.MeshToonMaterial({ color: 0x87ceeb })
  )
  libRoof.position.y = 6.5
  libRoof.rotation.y = Math.PI / 6
  libRoof.castShadow = true
  library.add(libRoof)
  
  // 顶部装饰球
  const roofBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 12, 12),
    new THREE.MeshToonMaterial({ color: 0xffd700 })
  )
  roofBall.position.y = 8
  library.add(roofBall)

  library.position.set(10, 0, -10)
  scene.add(library)

  // 体育馆 - 动森风格
  const gym = new THREE.Group()
  
  const gymBody = new THREE.Mesh(
    new THREE.BoxGeometry(6, 4.5, 6),
    new THREE.MeshToonMaterial({ color: 0xb8e6d5 })
  )
  gymBody.position.y = 2.25
  gymBody.castShadow = true
  gymBody.receiveShadow = true
  gym.add(gymBody)
  
  // 圆顶
  const gymRoof = new THREE.Mesh(
    new THREE.SphereGeometry(3.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshToonMaterial({ color: 0x6bcf7f })
  )
  gymRoof.position.y = 4.5
  gymRoof.castShadow = true
  gym.add(gymRoof)
  
  // 大门
  const gymDoor = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3, 0.15),
    new THREE.MeshToonMaterial({ color: 0x8b6f47 })
  )
  gymDoor.position.set(0, 1.5, 3.05)
  gym.add(gymDoor)

  gym.position.set(-10, 0, -10)
  scene.add(gym)
  
  // 添加装饰花坛
  addFlowerBeds()

  // 中央喷泉 - 美化版（更精致）
  const fountain = new THREE.Group()
  
  // 底座 - 多层设计
  const fountainBase = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2.5, 0.3, 32),
    new THREE.MeshStandardMaterial({
      color: 0x708090,
      metalness: 0.6,
      roughness: 0.4
    })
  )
  fountainBase.position.y = 0.15
  fountainBase.castShadow = true
  fountainBase.receiveShadow = true
  fountain.add(fountainBase)
  
  // 中层
  const fountainMid = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.8, 0.4, 32),
    new THREE.MeshStandardMaterial({
      color: 0xb0c4de,
      metalness: 0.7,
      roughness: 0.3
    })
  )
  fountainMid.position.y = 0.5
  fountainMid.castShadow = true
  fountainMid.receiveShadow = true
  fountain.add(fountainMid)
  
  // 内层（水池）
  const fountainPool = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.2, 32),
    new THREE.MeshStandardMaterial({
      color: 0x4682b4,
      transparent: true,
      opacity: 0.7,
      metalness: 0.9,
      roughness: 0.1
    })
  )
  fountainPool.position.y = 0.7
  fountainPool.receiveShadow = true
  fountain.add(fountainPool)

  // 中心柱 - 更精致
  const fountainPillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.4, 2.5, 16),
    new THREE.MeshStandardMaterial({
      color: 0x87CEEB,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x87CEEB,
      emissiveIntensity: 0.1
    })
  )
  fountainPillar.position.y = 2
  fountainPillar.castShadow = true
  fountain.add(fountainPillar)
  
  // 顶部装饰
  const fountainTop = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.3, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xffd700,
      emissiveIntensity: 0.2
    })
  )
  fountainTop.position.y = 3.15
  fountain.add(fountainTop)

  // 水花效果 - 更多粒子，更真实
  const waterParticles = new THREE.Group()
  for (let i = 0; i < 40; i++) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.03 + Math.random() * 0.02, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7,
        emissive: 0x87CEEB,
        emissiveIntensity: 0.4,
        roughness: 0.1,
        metalness: 0.9
      })
    )
    const angle = (i / 40) * Math.PI * 2
    const radius = 0.6 + Math.random() * 0.2
    particle.position.set(
      Math.cos(angle) * radius,
      2.5 + Math.random() * 0.8,
      Math.sin(angle) * radius
    )
    waterParticles.add(particle)
    // 保存初始位置用于动画
    ;(particle as any).initialY = particle.position.y
    ;(particle as any).angle = angle
    ;(particle as any).radius = radius
  }
  fountain.add(waterParticles)
  
  // 保存引用以便动画
  ;(fountain as any).waterParticles = waterParticles

  fountain.position.set(0, 0, 0)
  scene.add(fountain)

  // 云朵
  createClouds()
}

function createClouds() {
  const cloudGroup = new THREE.Group()

  for (let i = 0; i < 10; i++) {
    const cloud = new THREE.Group()
    for (let j = 0; j < 5; j++) {
      const cloudPart = new THREE.Mesh(
        new THREE.SphereGeometry(1 + Math.random() * 0.5, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.8,
          roughness: 1
        })
      )
      cloudPart.position.set((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 2)
      cloud.add(cloudPart)
    }
    cloud.position.set((Math.random() - 0.5) * 80, 20 + Math.random() * 10, (Math.random() - 0.5) * 80)
    cloud.scale.set(2, 1, 2)
    cloudGroup.add(cloud)
  }
  scene.add(cloudGroup)

  // 太阳 - 更柔和的光晕
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshBasicMaterial({ 
      color: 0xfff4e6,
      transparent: true,
      opacity: 0.9
    })
  )
  sun.position.set(40, 40, 40)
  scene.add(sun)
  
  // 太阳光晕
  const sunGlow = new THREE.Mesh(
    new THREE.SphereGeometry(4, 32, 32),
    new THREE.MeshBasicMaterial({ 
      color: 0xffd700,
      transparent: true,
      opacity: 0.3
    })
  )
  sunGlow.position.set(40, 40, 40)
  scene.add(sunGlow)

  // 月亮
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffcc })
  )
  moon.position.set(-40, 40, -40)
  moon.visible = false
  scene.add(moon)

  // 星星
  const starGeometry = new THREE.BufferGeometry()
  const starVertices = []
  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 400
    const y = Math.random() * 200 + 50
    const z = (Math.random() - 0.5) * 400
    starVertices.push(x, y, z)
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })
  )
  stars.visible = false
  scene.add(stars)

  // 保存引用
  ;(scene as any).sun = sun
  ;(scene as any).moon = moon
  ;(scene as any).stars = stars
}

function createEnvironment() {
  // 树木（更多更真实）
  const treePositions = [
    [15, 0], [-15, 0], [0, 15], [0, -15],
    [12, 12], [-12, 12], [12, -12], [-12, -12],
    [18, 5], [-18, 5], [5, 18], [-5, -18],
    [16, -8], [-16, 8], [8, -16], [-8, 16]
  ]

  treePositions.forEach(([x, z]) => {
    const tree = new THREE.Group()

    // 树干
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 2, 8),
      new THREE.MeshStandardMaterial({
        color: 0x6b4423,
        roughness: 0.95,
        metalness: 0.0
      })
    )
    trunk.position.y = 1
    trunk.castShadow = true
    tree.add(trunk)

    // 树冠（多层）- 更自然的绿色
    const foliage1 = new THREE.Mesh(
      new THREE.SphereGeometry(1, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x4a7c3e,
        roughness: 0.9,
        metalness: 0.0
      })
    )
    foliage1.position.y = 2.5
    foliage1.castShadow = true
    foliage1.receiveShadow = true
    tree.add(foliage1)

    const foliage2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x5a8f4a,
        roughness: 0.9,
        metalness: 0.0
      })
    )
    foliage2.position.y = 3.2
    foliage2.castShadow = true
    foliage2.receiveShadow = true
    tree.add(foliage2)

    const foliage3 = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x6a9f5a,
        roughness: 0.9,
        metalness: 0.0
      })
    )
    foliage3.position.y = 3.8
    foliage3.castShadow = true
    foliage3.receiveShadow = true
    tree.add(foliage3)

    tree.position.set(x, 0, z)
    scene.add(tree)
  })

  // 路灯
  const lightPositions = [
    [8, 0], [-8, 0], [0, 8], [0, -8]
  ]

  lightPositions.forEach(([x, z]) => {
    const streetLight = new THREE.Group()

    // 灯柱
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 4, 8),
      new THREE.MeshStandardMaterial({
        color: 0x7f8c8d,
        metalness: 0.8,
        roughness: 0.2
      })
    )
    pole.position.y = 2
    streetLight.add(pole)

    // 灯罩
    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.5, 8),
      new THREE.MeshStandardMaterial({
        color: 0xf39c12,
        emissive: 0xf39c12,
        emissiveIntensity: 0.5
      })
    )
    lampShade.position.y = 4.2
    streetLight.add(lampShade)

    // 点光源
    const pointLight = new THREE.PointLight(0xf39c12, 2, 10, 2)
    pointLight.position.y = 4
    streetLight.add(pointLight)

    streetLight.position.set(x, 0, z)
    scene.add(streetLight)
  })

  // 长椅
  const benchPositions = [
    [3, 3], [-3, 3], [3, -3], [-3, -3]
  ]

  benchPositions.forEach(([x, z]) => {
    const flowerBed = new THREE.Group()

    // 可爱的花坛底座
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1, 0.25, 8),
      new THREE.MeshToonMaterial({ color: 0xd2691e })
    )
    base.position.y = 0.125
    flowerBed.add(base)

    // 泥土
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.1, 8),
      new THREE.MeshToonMaterial({ color: 0x8b4513 })
    )
    soil.position.y = 0.3
    flowerBed.add(soil)

    // 动森风格的花朵
    const flowerTypes = [
      { color: 0xff69b4, petalCount: 5 },  // 粉色
      { color: 0xffd700, petalCount: 6 },  // 黄色
      { color: 0xff6b6b, petalCount: 5 },  // 红色
      { color: 0x87ceeb, petalCount: 4 },  // 蓝色
      { color: 0xffa500, petalCount: 5 }   // 橙色
    ]

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const radius = 0.35 + Math.random() * 0.25
      const flowerType = flowerTypes[i % flowerTypes.length]

      // 花茎
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.35, 6),
        new THREE.MeshToonMaterial({ color: 0x4a7c3e })
      )
      stem.position.set(
        Math.cos(angle) * radius,
        0.475,
        Math.sin(angle) * radius
      )
      flowerBed.add(stem)

      // 花心
      const flowerCenter = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshToonMaterial({ color: 0xffd700 })
      )
      flowerCenter.position.set(
        Math.cos(angle) * radius,
        0.65,
        Math.sin(angle) * radius
      )
      flowerBed.add(flowerCenter)

      // 花瓣（围绕花心）
      for (let j = 0; j < flowerType.petalCount; j++) {
        const petalAngle = (j / flowerType.petalCount) * Math.PI * 2
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 8),
          new THREE.MeshToonMaterial({ color: flowerType.color })
        )
        petal.position.set(
          Math.cos(angle) * radius + Math.cos(petalAngle) * 0.08,
          0.65,
          Math.sin(angle) * radius + Math.sin(petalAngle) * 0.08
        )
        petal.scale.set(1, 0.5, 1.2)
        flowerBed.add(petal)
      }
    }

    flowerBed.position.set(x, 0, z)
    scene.add(flowerBed)
  })

}

// 添加可爱的花坛 - 动森风格
function addFlowerBeds() {
  const flowerBedPositions = [
    [6, 6], [-6, 6], [6, -6], [-6, -6],
    [12, 0], [-12, 0], [0, 12], [0, -12]
  ]

  flowerBedPositions.forEach(([x, z]) => {
    const flowerBed = new THREE.Group()

    // 可爱的花坛底座
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1, 0.25, 8),
      new THREE.MeshToonMaterial({ color: 0xd2691e })
    )
    base.position.y = 0.125
    flowerBed.add(base)

    // 泥土
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.1, 8),
      new THREE.MeshToonMaterial({ color: 0x8b4513 })
    )
    soil.position.y = 0.3
    flowerBed.add(soil)

    // 动森风格的花朵
    const flowerTypes = [
      { color: 0xff69b4, petalCount: 5 },
      { color: 0xffd700, petalCount: 6 },
      { color: 0xff6b6b, petalCount: 5 },
      { color: 0x87ceeb, petalCount: 4 },
      { color: 0xffa500, petalCount: 5 }
    ]

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const radius = 0.35 + Math.random() * 0.25
      const flowerType = flowerTypes[i % flowerTypes.length]

      // 花茎
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.35, 6),
        new THREE.MeshToonMaterial({ color: 0x4a7c3e })
      )
      stem.position.set(
        Math.cos(angle) * radius,
        0.475,
        Math.sin(angle) * radius
      )
      flowerBed.add(stem)

      // 花心
      const flowerCenter = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshToonMaterial({ color: 0xffd700 })
      )
      flowerCenter.position.set(
        Math.cos(angle) * radius,
        0.65,
        Math.sin(angle) * radius
      )
      flowerBed.add(flowerCenter)

      // 花瓣（围绕花心）
      for (let j = 0; j < flowerType.petalCount; j++) {
        const petalAngle = (j / flowerType.petalCount) * Math.PI * 2
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 8),
          new THREE.MeshToonMaterial({ color: flowerType.color })
        )
        petal.position.set(
          Math.cos(angle) * radius + Math.cos(petalAngle) * 0.08,
          0.65,
          Math.sin(angle) * radius + Math.sin(petalAngle) * 0.08
        )
        petal.scale.set(1, 0.5, 1.2)
        flowerBed.add(petal)
      }
    }

    flowerBed.position.set(x, 0, z)
    scene.add(flowerBed)
  })
}

function createFences() {
  const fencePositions = [
    { start: [-25, 0, -25], end: [25, 0, -25] },
    { start: [-25, 0, 25], end: [25, 0, 25] },
    { start: [-25, 0, -25], end: [-25, 0, 25] },
    { start: [25, 0, -25], end: [25, 0, 25] }
  ]

  fencePositions.forEach(({ start, end }) => {
    const distance = Math.sqrt(
      Math.pow(end[0] - start[0], 2) + Math.pow(end[2] - start[2], 2)
    )
    const segments = Math.floor(distance / 2)

    for (let i = 0; i < segments; i++) {
      const t = i / segments
      const x = start[0] + (end[0] - start[0]) * t
      const z = start[2] + (end[2] - start[2]) * t

      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1, 8),
        new THREE.MeshStandardMaterial({
          color: 0x8B4513,
          roughness: 0.9
        })
      )
      post.position.set(x, 0.5, z)
      post.castShadow = true
      scene.add(post)
    }
  })
}

function createGrass() {
  const grassGroup = new THREE.Group()

  for (let i = 0; i < 100; i++) {
    const blade = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.3, 3),
      new THREE.MeshStandardMaterial({
        color: 0x7ec850,
        roughness: 0.9
      })
    )
    blade.position.set(
      (Math.random() - 0.5) * 40,
      0.15,
      (Math.random() - 0.5) * 40
    )
    blade.rotation.z = (Math.random() - 0.5) * 0.2
    grassGroup.add(blade)
  }

  scene.add(grassGroup)
}

function createRocks() {
  const rockPositions = [
    [17, 0, 8], [-17, 0, -8], [8, 0, 17], [-8, 0, -17],
    [14, 0, -6], [-14, 0, 6], [6, 0, -14], [-6, 0, 14]
  ]

  rockPositions.forEach(([x, z]) => {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.2, 0),
      new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.9,
        metalness: 0.1
      })
    )
    rock.position.set(x, 0.2, z)
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    rock.castShadow = true
    rock.receiveShadow = true
    scene.add(rock)
  })

  // 蝴蝶
  createButterflies()

  // 鸟
  createBirds()
}

function createButterflies() {
  for (let i = 0; i < 8; i++) {
    const butterfly = new THREE.Group()

    // 可爱的身体
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.03, 0.2, 6, 8),
      new THREE.MeshToonMaterial({ color: 0x2c3e50 })
    )
    butterfly.add(body)
    
    // 触角
    const antennaGeometry = new THREE.CapsuleGeometry(0.01, 0.12, 4, 6)
    const antennaMaterial = new THREE.MeshToonMaterial({ color: 0x2c3e50 })
    
    const leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial)
    leftAntenna.position.set(-0.02, 0.15, 0)
    leftAntenna.rotation.z = -0.3
    butterfly.add(leftAntenna)
    
    const rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial)
    rightAntenna.position.set(0.02, 0.15, 0)
    rightAntenna.rotation.z = 0.3
    butterfly.add(rightAntenna)

    // 更大更可爱的翅膀
    const wingColors = [
      0xffb6d9, 0xb8e6ff, 0xffd9b3, 0xc9f0c9,
      0xffd4e5, 0xe6ccff, 0xfff4cc, 0xccf2ff
    ]
    
    const wingGeometry = new THREE.CircleGeometry(0.15, 12)
    const wingMaterial = new THREE.MeshToonMaterial({
      color: wingColors[i],
      side: THREE.DoubleSide
    })

    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial)
    leftWing.position.set(-0.12, 0, 0)
    leftWing.rotation.y = Math.PI / 3
    leftWing.scale.set(1, 1.3, 1)
    butterfly.add(leftWing)

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial)
    rightWing.position.set(0.12, 0, 0)
    rightWing.rotation.y = -Math.PI / 3
    rightWing.scale.set(1, 1.3, 1)
    butterfly.add(rightWing)
    
    // 翅膀上的斑点装饰
    const spotGeometry = new THREE.CircleGeometry(0.03, 8)
    const spotMaterial = new THREE.MeshToonMaterial({ 
      color: 0xffffff,
      side: THREE.DoubleSide
    })
    
    const leftSpot = new THREE.Mesh(spotGeometry, spotMaterial)
    leftSpot.position.set(-0.12, 0.05, 0.01)
    leftSpot.rotation.y = Math.PI / 3
    butterfly.add(leftSpot)
    
    const rightSpot = new THREE.Mesh(spotGeometry, spotMaterial)
    rightSpot.position.set(0.12, 0.05, 0.01)
    rightSpot.rotation.y = -Math.PI / 3
    butterfly.add(rightSpot)

    butterfly.position.set(
      (Math.random() - 0.5) * 35,
      1.5 + Math.random() * 2.5,
      (Math.random() - 0.5) * 35
    )

    butterflies.push(butterfly)
    scene.add(butterfly)
  }
}

function createBirds() {
  for (let i = 0; i < 3; i++) {
    const bird = new THREE.Group()

    // 身体
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    )
    bird.add(body)

    // 翅膀
    const wingGeometry = new THREE.ConeGeometry(0.15, 0.4, 8)
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 })

    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial)
    leftWing.position.set(-0.2, 0, 0)
    leftWing.rotation.z = Math.PI / 4
    bird.add(leftWing)

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial)
    rightWing.position.set(0.2, 0, 0)
    rightWing.rotation.z = -Math.PI / 4
    bird.add(rightWing)

    bird.position.set(
      (Math.random() - 0.5) * 40,
      8 + Math.random() * 5,
      (Math.random() - 0.5) * 40
    )

    birds.push(bird)
    scene.add(bird)
  }
}

// 创建NPC角色
function createNPCs() {
  const npcPositions = [
    { x: 8, z: 8, color: 0xffb6d9, animal: 'cat' }, // 粉色小猫
    { x: -8, z: 8, color: 0xb8e6ff, animal: 'rabbit' }, // 蓝色兔子
    { x: 8, z: -8, color: 0xffd9b3, animal: 'bear' }, // 橙色小熊
    { x: -8, z: -8, color: 0xc9f0c9, animal: 'dog' } // 绿色小狗
  ]
  
  npcPositions.forEach((pos, index) => {
    const npc = createNPCCharacter(pos.color, index, pos.animal)
    npc.position.set(pos.x, 0, pos.z)
    npc.rotation.y = Math.random() * Math.PI * 2
    scene.add(npc)
    
    // 保存引用以便动画
    ;(npc as any).walkCycle = Math.random() * Math.PI * 2
    ;(npc as any).idleTime = Math.random() * 5 + 2
    ;(npc as any).isIdle = true
    ;(npc as any).targetRotation = npc.rotation.y
  })
}

// 创建NPC角色模型 - 动物森友会风格（不同动物）
function createNPCCharacter(color: number, index: number, animal: string): THREE.Group {
  const npc = new THREE.Group()
  
  // Q版大头
  const headGeometry = new THREE.SphereGeometry(0.35, 16, 16)
  const headMaterial = new THREE.MeshToonMaterial({ color: color })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.y = 1.15
  head.castShadow = true
  npc.add(head)
  
  // 根据动物类型添加特征
  if (animal === 'cat') {
    // 猫耳朵
    const earGeometry = new THREE.ConeGeometry(0.12, 0.25, 8)
    const earMaterial = new THREE.MeshToonMaterial({ color: color })
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial)
    leftEar.position.set(-0.2, 1.45, 0)
    leftEar.rotation.z = -0.3
    leftEar.castShadow = true
    npc.add(leftEar)
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial)
    rightEar.position.set(0.2, 1.45, 0)
    rightEar.rotation.z = 0.3
    rightEar.castShadow = true
    npc.add(rightEar)
  } else if (animal === 'rabbit') {
    // 兔子长耳朵
    const earGeometry = new THREE.CapsuleGeometry(0.08, 0.4, 8, 12)
    const earMaterial = new THREE.MeshToonMaterial({ color: color })
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial)
    leftEar.position.set(-0.15, 1.55, -0.1)
    leftEar.rotation.z = -0.2
    leftEar.castShadow = true
    npc.add(leftEar)
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial)
    rightEar.position.set(0.15, 1.55, -0.1)
    rightEar.rotation.z = 0.2
    rightEar.castShadow = true
    npc.add(rightEar)
  } else if (animal === 'bear') {
    // 熊耳朵
    const earGeometry = new THREE.SphereGeometry(0.1, 12, 12)
    const earMaterial = new THREE.MeshToonMaterial({ color: color })
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial)
    leftEar.position.set(-0.25, 1.4, -0.05)
    leftEar.castShadow = true
    npc.add(leftEar)
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial)
    rightEar.position.set(0.25, 1.4, -0.05)
    rightEar.castShadow = true
    npc.add(rightEar)
  } else if (animal === 'dog') {
    // 狗耳朵（垂耳）
    const earGeometry = new THREE.CapsuleGeometry(0.08, 0.3, 8, 12)
    const earMaterial = new THREE.MeshToonMaterial({ color: color })
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial)
    leftEar.position.set(-0.25, 1.2, 0)
    leftEar.rotation.z = -0.8
    leftEar.castShadow = true
    npc.add(leftEar)
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial)
    rightEar.position.set(0.25, 1.2, 0)
    rightEar.rotation.z = 0.8
    rightEar.castShadow = true
    npc.add(rightEar)
  }
  
  // 大眼睛
  const eyeWhiteGeometry = new THREE.SphereGeometry(0.07, 12, 12)
  const eyeWhiteMaterial = new THREE.MeshToonMaterial({ color: 0xffffff })
  
  const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial)
  leftEyeWhite.position.set(-0.11, 1.2, 0.32)
  leftEyeWhite.scale.set(1, 1.1, 0.5)
  npc.add(leftEyeWhite)
  
  const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial)
  rightEyeWhite.position.set(0.11, 1.2, 0.32)
  rightEyeWhite.scale.set(1, 1.1, 0.5)
  npc.add(rightEyeWhite)
  
  // 瞳孔
  const pupilGeometry = new THREE.SphereGeometry(0.04, 10, 10)
  const pupilMaterial = new THREE.MeshToonMaterial({ color: 0x2c3e50 })
  
  const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial)
  leftPupil.position.set(-0.11, 1.2, 0.35)
  npc.add(leftPupil)
  
  const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial)
  rightPupil.position.set(0.11, 1.2, 0.35)
  npc.add(rightPupil)
  
  // 眼睛高光
  const shineGeometry = new THREE.SphereGeometry(0.02, 8, 8)
  const shineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  
  const leftShine = new THREE.Mesh(shineGeometry, shineMaterial)
  leftShine.position.set(-0.09, 1.23, 0.37)
  npc.add(leftShine)
  
  const rightShine = new THREE.Mesh(shineGeometry, shineMaterial)
  rightShine.position.set(0.13, 1.23, 0.37)
  npc.add(rightShine)
  
  // 鼻子
  const noseGeometry = new THREE.SphereGeometry(0.04, 8, 8)
  const noseMaterial = new THREE.MeshToonMaterial({ color: 0x2c3e50 })
  const nose = new THREE.Mesh(noseGeometry, noseMaterial)
  nose.position.set(0, 1.1, 0.35)
  npc.add(nose)
  
  // Q版身体
  const bodyGeometry = new THREE.SphereGeometry(0.25, 14, 14)
  const bodyMaterial = new THREE.MeshToonMaterial({ color: 0xffffff })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 0.5
  body.scale.set(1, 1.2, 1)
  body.castShadow = true
  npc.add(body)
  
  // 短手臂
  const armGeometry = new THREE.CapsuleGeometry(0.07, 0.3, 8, 12)
  const armMaterial = new THREE.MeshToonMaterial({ color: color })
  
  const leftArm = new THREE.Mesh(armGeometry, armMaterial)
  leftArm.position.set(-0.32, 0.6, 0)
  leftArm.rotation.z = 0.4
  leftArm.castShadow = true
  npc.add(leftArm)
  
  const rightArm = new THREE.Mesh(armGeometry, armMaterial)
  rightArm.position.set(0.32, 0.6, 0)
  rightArm.rotation.z = -0.4
  rightArm.castShadow = true
  npc.add(rightArm)
  
  // 圆手
  const handGeometry = new THREE.SphereGeometry(0.09, 10, 10)
  const handMaterial = new THREE.MeshToonMaterial({ color: color })
  
  const leftHand = new THREE.Mesh(handGeometry, handMaterial)
  leftHand.position.set(-0.44, 0.38, 0)
  leftHand.castShadow = true
  npc.add(leftHand)
  
  const rightHand = new THREE.Mesh(handGeometry, handMaterial)
  rightHand.position.set(0.44, 0.38, 0)
  rightHand.castShadow = true
  npc.add(rightHand)
  
  // 短腿
  const legGeometry = new THREE.CapsuleGeometry(0.08, 0.25, 8, 12)
  const legMaterial = new THREE.MeshToonMaterial({ color: color })
  
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
  leftLeg.position.set(-0.13, 0.08, 0)
  leftLeg.castShadow = true
  npc.add(leftLeg)
  
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
  rightLeg.position.set(0.13, 0.08, 0)
  rightLeg.castShadow = true
  npc.add(rightLeg)
  
  // 可爱圆脚
  const footGeometry = new THREE.SphereGeometry(0.11, 12, 12)
  const footMaterial = new THREE.MeshToonMaterial({ color: color })
  
  const leftFoot = new THREE.Mesh(footGeometry, footMaterial)
  leftFoot.position.set(-0.13, -0.1, 0.05)
  leftFoot.scale.set(1, 0.6, 1.2)
  leftFoot.castShadow = true
  npc.add(leftFoot)
  
  const rightFoot = new THREE.Mesh(footGeometry, footMaterial)
  rightFoot.position.set(0.13, -0.1, 0.05)
  rightFoot.scale.set(1, 0.6, 1.2)
  rightFoot.castShadow = true
  npc.add(rightFoot)
  
  // 保存身体部位引用
  ;(npc as any).bodyParts = {
    leftArm,
    rightArm,
    leftLeg,
    rightLeg
  }
  
  return npc
}

// 添加更多场景细节
function addSceneDetails() {
  // 添加自行车
  const bikePositions = [
    { x: 12, z: 0, rotation: Math.PI / 4 },
    { x: -12, z: 0, rotation: -Math.PI / 4 },
    { x: 0, z: 12, rotation: 0 }
  ]
  
  bikePositions.forEach((pos) => {
    const bike = createBike()
    bike.position.set(pos.x, 0, pos.z)
    bike.rotation.y = pos.rotation
    scene.add(bike)
  })
  
  // 添加垃圾桶
  const trashCanPositions = [
    { x: 4, z: 4 },
    { x: -4, z: 4 },
    { x: 4, z: -4 },
    { x: -4, z: -4 }
  ]
  
  trashCanPositions.forEach((pos) => {
    const trashCan = createTrashCan()
    trashCan.position.set(pos.x, 0, pos.z)
    scene.add(trashCan)
  })
  
  // 添加自动售货机
  const vendingMachinePositions = [
    { x: 10, z: 0 },
    { x: -10, z: 0 }
  ]
  
  vendingMachinePositions.forEach((pos) => {
    const vendingMachine = createVendingMachine()
    vendingMachine.position.set(pos.x, 0, pos.z)
    vendingMachine.rotation.y = pos.x > 0 ? -Math.PI / 2 : Math.PI / 2
    scene.add(vendingMachine)
  })
  
  // 添加更多装饰性元素
  addDecorativeElements()
}

// 创建自行车
function createBike(): THREE.Group {
  const bike = new THREE.Group()
  
  // 车架
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.05, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.6, metalness: 0.4 })
  )
  frame.rotation.z = Math.PI / 4
  frame.position.y = 0.3
  bike.add(frame)
  
  // 前轮
  const frontWheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
  )
  frontWheel.rotation.z = Math.PI / 2
  frontWheel.position.set(0.4, 0.25, 0)
  bike.add(frontWheel)
  
  // 后轮
  const backWheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
  )
  backWheel.rotation.z = Math.PI / 2
  backWheel.position.set(-0.4, 0.25, 0)
  bike.add(backWheel)
  
  // 车座
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.05, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 })
  )
  seat.position.set(-0.2, 0.5, 0)
  bike.add(seat)
  
  // 车把
  const handlebar = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.03, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.6, metalness: 0.4 })
  )
  handlebar.position.set(0.4, 0.6, 0)
  bike.add(handlebar)
  
  return bike
}

// 创建垃圾桶
function createTrashCan(): THREE.Group {
  const trashCan = new THREE.Group()
  
  // 桶身
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.35, 0.8, 16),
    new THREE.MeshStandardMaterial({ 
      color: 0x34495e,
      roughness: 0.7,
      metalness: 0.3
    })
  )
  body.position.y = 0.4
  body.castShadow = true
  trashCan.add(body)
  
  // 盖子
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.05, 16),
    new THREE.MeshStandardMaterial({ 
      color: 0x2c3e50,
      roughness: 0.6,
      metalness: 0.4
    })
  )
  lid.position.y = 0.825
  lid.castShadow = true
  trashCan.add(lid)
  
  // 分类标识
  const label = new THREE.Mesh(
    new THREE.RingGeometry(0.25, 0.3, 16),
    new THREE.MeshStandardMaterial({ 
      color: 0x27ae60,
      emissive: 0x27ae60,
      emissiveIntensity: 0.2
    })
  )
  label.rotation.x = -Math.PI / 2
  label.position.y = 0.4
  trashCan.add(label)
  
  return trashCan
}

// 创建自动售货机
function createVendingMachine(): THREE.Group {
  const machine = new THREE.Group()
  
  // 主体
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.8, 0.6),
    new THREE.MeshStandardMaterial({ 
      color: 0xe74c3c,
      roughness: 0.5,
      metalness: 0.3
    })
  )
  body.position.y = 0.9
  body.castShadow = true
  body.receiveShadow = true
  machine.add(body)
  
  // 玻璃面板
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.5, 0.05),
    new THREE.MeshStandardMaterial({ 
      color: 0x87CEEB,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0.9
    })
  )
  glass.position.set(0, 0.9, 0.31)
  machine.add(glass)
  
  // 商品展示（简化）
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      const item = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.2, 0.02),
        new THREE.MeshStandardMaterial({ 
          color: [0xff6b6b, 0x4ecdc4, 0xffe66d][j],
          roughness: 0.4,
          metalness: 0.6
        })
      )
      item.position.set(-0.2 + i * 0.2, 0.6 + j * 0.4, 0.32)
      machine.add(item)
    }
  }
  
  // 投币口
  const coinSlot = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.15, 0.05),
    new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      roughness: 0.2,
      metalness: 0.9
    })
  )
  coinSlot.position.set(0.25, 0.2, 0.31)
  machine.add(coinSlot)
  
  // 取物口
  const dispenser = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.2, 0.1),
    new THREE.MeshStandardMaterial({ 
      color: 0x2c3e50,
      roughness: 0.6,
      metalness: 0.3
    })
  )
  dispenser.position.set(0, 0.1, 0.31)
  machine.add(dispenser)
  
  return machine
}

// 添加装饰性元素
function addDecorativeElements() {
  // 添加更多小装饰
  // 路标
  const signPositions = [
    { x: 15, z: 0, text: '图书馆' },
    { x: -15, z: 0, text: '体育馆' },
    { x: 0, z: 15, text: '教学楼' }
  ]
  
  signPositions.forEach((pos) => {
    const sign = new THREE.Group()
    
    // 柱子
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8),
      new THREE.MeshStandardMaterial({ 
        color: 0x7f8c8d,
        metalness: 0.8,
        roughness: 0.2
      })
    )
    pole.position.y = 0.75
    pole.castShadow = true
    sign.add(pole)
    
    // 标志牌
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.6, 0.1),
      new THREE.MeshStandardMaterial({ 
        color: 0x3498db,
        roughness: 0.6
      })
    )
    board.position.y = 1.5
    board.castShadow = true
    sign.add(board)
    
    sign.position.set(pos.x, 0, pos.z)
    sign.rotation.y = pos.x > 0 ? -Math.PI / 2 : (pos.x < 0 ? Math.PI / 2 : 0)
    scene.add(sign)
  })
  
  // 添加更多小物件
  // 书堆（图书馆附近）
  const bookPile = new THREE.Group()
  for (let i = 0; i < 5; i++) {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.05, 0.2),
      new THREE.MeshStandardMaterial({ 
        color: [0x8B4513, 0x654321, 0x4a4a4a][i % 3],
        roughness: 0.7
      })
    )
    book.position.set(
      (i - 2) * 0.15,
      0.025 + i * 0.05,
      0
    )
    book.rotation.z = (Math.random() - 0.5) * 0.2
    bookPile.add(book)
  }
  bookPile.position.set(9, 0, -9)
  scene.add(bookPile)
  
  // 运动器材（体育馆附近）
  const equipment = new THREE.Group()
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 16),
    new THREE.MeshStandardMaterial({ 
      color: 0xe74c3c,
      roughness: 0.6,
      metalness: 0.2
    })
  )
  ball.position.set(0, 0.3, 0)
  ball.castShadow = true
  equipment.add(ball)
  equipment.position.set(-9, 0, -9)
  scene.add(equipment)
}

// 碰撞检测系统
let collisionObjects: Array<{ position: THREE.Vector3; size: THREE.Vector3 }> = []

// 初始化碰撞对象
function initCollisionObjects() {
  collisionObjects = []
  
  console.log('[碰撞检测] 开始初始化碰撞对象')
  
  // 建筑物碰撞盒
  const buildings = [
    { x: 10, z: 10, width: 4, depth: 6, height: 4 }, // 教学楼1
    { x: -10, z: 10, width: 4, depth: 6, height: 4 }, // 教学楼2
    { x: 10, z: -10, width: 6, depth: 4, height: 6 }, // 图书馆
    { x: -10, z: -10, width: 6, depth: 6, height: 5 } // 体育馆
  ]
  
  buildings.forEach(building => {
    collisionObjects.push({
      position: new THREE.Vector3(building.x, 0, building.z),
      size: new THREE.Vector3(building.width, building.height, building.depth)
    })
  })
  console.log('[碰撞检测] 添加了', buildings.length, '个建筑物碰撞盒')
  
  // 其他障碍物
  const obstacles = [
    { x: 0, z: 0, width: 3, depth: 3 }, // 喷泉
    { x: 8, z: 0, width: 0.8, depth: 1.8 }, // 售货机
    { x: -8, z: 0, width: 0.8, depth: 1.8 }, // 售货机
    { x: 4, z: 4, width: 0.6, depth: 0.6 }, // 垃圾桶
    { x: -4, z: 4, width: 0.6, depth: 0.6 },
    { x: 4, z: -4, width: 0.6, depth: 0.6 },
    { x: -4, z: -4, width: 0.6, depth: 0.6 }
  ]
  
  obstacles.forEach(obstacle => {
    collisionObjects.push({
      position: new THREE.Vector3(obstacle.x, 0, obstacle.z),
      size: new THREE.Vector3(obstacle.width, 2, obstacle.depth)
    })
  })
  console.log('[碰撞检测] 添加了', obstacles.length, '个障碍物碰撞盒')
  
  // 收集场景中所有可碰撞的物体（只收集建筑主体，排除装饰物）
  let sceneObjectCount = 0
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      // 排除角色自身和NPC
      if (character && character.getObjectById(object.id)) return
      
      // 排除地面
      if (object.geometry instanceof THREE.PlaneGeometry) {
        return
      }

      // 排除交互区域标记、粒子、装饰物
      if (object.geometry instanceof THREE.CircleGeometry || 
          object.geometry instanceof THREE.RingGeometry ||
          object.geometry instanceof THREE.SphereGeometry ||
          object instanceof THREE.Points) {
        return
      }

      const box = new THREE.Box3().setFromObject(object)
      const size = box.getSize(new THREE.Vector3())

      // 排除超大物体（天空盒等）
      if (size.x > 30 || size.z > 30 || size.y > 30) {
        return
      }
      
      // 排除细小装饰物（只保留建筑主体和大型障碍物）
      // 只收集宽度或深度 > 2 且高度 > 3 的物体（建筑主体）
      if ((size.x > 2 || size.z > 2) && size.y > 3) {
        const center = box.getCenter(new THREE.Vector3())
        collisionObjects.push({
          position: center,
          size: size
        })
        sceneObjectCount++
        console.log('[碰撞检测] 添加建筑物体:', { size: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) }, center: { x: center.x.toFixed(2), z: center.z.toFixed(2) } })
      }
    }
  })
  
  console.log('[碰撞检测] 从场景收集了', sceneObjectCount, '个物体')
  console.log('[碰撞检测] 总共', collisionObjects.length, '个碰撞对象')
}

// 检查碰撞
function checkCollision(x: number, z: number): boolean {
  const characterRadius = 0.5 // 角色碰撞半径
  const characterPos = new THREE.Vector3(x, 0, z)
  
  for (const obj of collisionObjects) {
    // 计算物体边界（考虑大小）
    const halfWidth = obj.size.x / 2 + characterRadius
    const halfDepth = obj.size.z / 2 + characterRadius
    
    const minX = obj.position.x - halfWidth
    const maxX = obj.position.x + halfWidth
    const minZ = obj.position.z - halfDepth
    const maxZ = obj.position.z + halfDepth
    
    // 检查是否在碰撞盒内
    if (characterPos.x >= minX && characterPos.x <= maxX &&
        characterPos.z >= minZ && characterPos.z <= maxZ) {
      return true // 发生碰撞
    }
  }
  
  // 检查边界
  const boundary = 20
  if (Math.abs(x) > boundary || Math.abs(z) > boundary) {
    return true
  }
  
  return false
}

function setupControls() {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
}

function handleKeyDown(e: KeyboardEvent) {
  keys.add(e.key.toLowerCase())

  // E 键交互
  if (e.key.toLowerCase() === 'e' && currentZone.value) {
    messageService.success(`进入${currentZone.value.name}`)
    router.push(currentZone.value.route)
  }
}

function handleKeyUp(e: KeyboardEvent) {
  keys.delete(e.key.toLowerCase())
}

function animate() {
  animationId = requestAnimationFrame(animate)

  // 角色移动
  const moveSpeed = 0.15
  isWalking = false

  // 计算移动方向
  let moveX = 0
  let moveZ = 0
  
  if (keys.has('w') || keys.has('arrowup')) {
    moveZ -= moveSpeed
    isWalking = true
  }
  if (keys.has('s') || keys.has('arrowdown')) {
    moveZ += moveSpeed
    isWalking = true
  }
  if (keys.has('a') || keys.has('arrowleft')) {
    moveX -= moveSpeed
    isWalking = true
  }
  if (keys.has('d') || keys.has('arrowright')) {
    moveX += moveSpeed
    isWalking = true
  }
  
  // 计算目标位置
  const newX = character.position.x + moveX
  const newZ = character.position.z + moveZ
  
  // 碰撞检测
  if (!checkCollision(newX, newZ)) {
    character.position.x = newX
    character.position.z = newZ
    
    // 更新面向方向（修复：面向移动方向）
    if (moveX !== 0 || moveZ !== 0) {
      // 使用atan2计算正确的角度：atan2(x, z) 在Three.js中是正确的
      character.rotation.y = Math.atan2(moveX, moveZ)
    }
  }

  // 行走动画 - 更真实的动画
  if (isWalking) {
    walkCycle += 0.2

    const bodyParts = (character as any).bodyParts
    if (bodyParts) {
      // 手臂摆动 - 更自然的幅度
      const armSwing = Math.sin(walkCycle) * 0.5
      const armSwingZ = Math.sin(walkCycle) * 0.2
      
      if (bodyParts.leftUpperArm) {
        bodyParts.leftUpperArm.rotation.x = -armSwing
        bodyParts.leftUpperArm.rotation.z = armSwingZ
      }
      if (bodyParts.rightUpperArm) {
        bodyParts.rightUpperArm.rotation.x = armSwing
        bodyParts.rightUpperArm.rotation.z = -armSwingZ
      }
      if (bodyParts.leftForearm) {
        bodyParts.leftForearm.rotation.x = -armSwing * 0.5
      }
      if (bodyParts.rightForearm) {
        bodyParts.rightForearm.rotation.x = armSwing * 0.5
      }
      
      // 腿部摆动 - 更真实的步行动作
      const legSwing = Math.sin(walkCycle) * 0.4
      const legSwingZ = Math.sin(walkCycle) * 0.15
      
      if (bodyParts.leftThigh) {
        bodyParts.leftThigh.rotation.x = -legSwing
        bodyParts.leftThigh.rotation.z = legSwingZ
      }
      if (bodyParts.rightThigh) {
        bodyParts.rightThigh.rotation.x = legSwing
        bodyParts.rightThigh.rotation.z = -legSwingZ
      }
      if (bodyParts.leftShin) {
        bodyParts.leftShin.rotation.x = Math.max(0, -legSwing * 1.5)
      }
      if (bodyParts.rightShin) {
        bodyParts.rightShin.rotation.x = Math.max(0, legSwing * 1.5)
      }
    }

    // 轻微上下跳动 - 更自然的节奏
    character.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.03
    
    // 身体轻微前后倾斜
    const torso = character.children.find((child: any) => child.position?.y === 0.6)
    if (torso) {
      torso.rotation.z = Math.sin(walkCycle) * 0.05
    }
  } else {
    // 重置动画
    const bodyParts = (character as any).bodyParts
    if (bodyParts) {
      if (bodyParts.leftUpperArm) bodyParts.leftUpperArm.rotation.x = 0
      if (bodyParts.rightUpperArm) bodyParts.rightUpperArm.rotation.x = 0
      if (bodyParts.leftForearm) bodyParts.leftForearm.rotation.x = 0
      if (bodyParts.rightForearm) bodyParts.rightForearm.rotation.x = 0
      if (bodyParts.leftThigh) bodyParts.leftThigh.rotation.x = 0
      if (bodyParts.rightThigh) bodyParts.rightThigh.rotation.x = 0
      if (bodyParts.leftShin) bodyParts.leftShin.rotation.x = 0
      if (bodyParts.rightShin) bodyParts.rightShin.rotation.x = 0
      
      if (bodyParts.leftUpperArm) bodyParts.leftUpperArm.rotation.z = 0
      if (bodyParts.rightUpperArm) bodyParts.rightUpperArm.rotation.z = 0
      if (bodyParts.leftThigh) bodyParts.leftThigh.rotation.z = 0
      if (bodyParts.rightThigh) bodyParts.rightThigh.rotation.z = 0
    }
    
    character.position.y = 0
    
    // 重置身体倾斜
    const torso = character.children.find((child: any) => child.position?.y === 0.6)
    if (torso) {
      torso.rotation.z = 0
    }
  }

  // 限制移动范围
  character.position.x = Math.max(-20, Math.min(20, character.position.x))
  character.position.z = Math.max(-20, Math.min(20, character.position.z))

  // 更新角色位置（用于小地图）
  characterPos.value = {
    x: character.position.x,
    z: character.position.z
  }

  // 相机跟随 - 更平滑的跟随效果
  const targetX = character.position.x
  const targetZ = character.position.z + 12
  const targetY = character.position.y + 8
  
  // 平滑插值
  camera.position.x += (targetX - camera.position.x) * 0.1
  camera.position.z += (targetZ - camera.position.z) * 0.1
  camera.position.y += (targetY - camera.position.y) * 0.1
  
  // 看向角色前方一点，更自然的视角
  const lookAtX = character.position.x
  const lookAtY = character.position.y + 1
  const lookAtZ = character.position.z
  
  camera.lookAt(lookAtX, lookAtY, lookAtZ)

  // 检查交互区域
  checkZones()

  // 蝴蝶动画
  butterflies.forEach((butterfly, i) => {
    const time = Date.now() * 0.001
    butterfly.position.y += Math.sin(time * 2 + i) * 0.01
    butterfly.rotation.y += 0.02

    // 翅膀扇动
    const leftWing = butterfly.children[0]
    const rightWing = butterfly.children[1]
    if (leftWing && rightWing) {
      leftWing.rotation.y = Math.sin(time * 10 + i) * 0.5
      rightWing.rotation.y = -Math.sin(time * 10 + i) * 0.5
    }
  })
  
  // 喷泉水花动画
  const fountain = scene.children.find((child: any) => child.waterParticles) as any
  if (fountain && fountain.waterParticles) {
    const time = Date.now() * 0.001
    fountain.waterParticles.children.forEach((particle: any, i: number) => {
      if (particle.initialY !== undefined) {
        particle.position.y = particle.initialY + Math.sin(time * 3 + i) * 0.3
        const angle = particle.angle + time * 0.5
        particle.position.x = Math.cos(angle) * particle.radius
        particle.position.z = Math.sin(angle) * particle.radius
      }
    })
  }
  
  // 交互区域粒子动画
  zones.forEach((zone: any) => {
    if (zone.particles) {
      const time = Date.now() * 0.001
      const positions = zone.particles.geometry.attributes.position.array as Float32Array
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] = 0.5 + Math.sin(time * 2 + i * 0.1) * 1.5
      }
      zone.particles.geometry.attributes.position.needsUpdate = true
      
      // 外圈旋转
      if (zone.outerCircle) {
        zone.outerCircle.rotation.z += 0.01
      }
    }
  })
  
  // NPC动画 - 闲逛和待机
  scene.children.forEach((child: any) => {
    if (child.bodyParts && child !== character) {
      const time = Date.now() * 0.001
      
      if (child.isIdle) {
        // 待机动画 - 轻微呼吸和左右看
        child.idleTime -= 0.016
        if (child.idleTime <= 0) {
          child.isIdle = false
          child.targetRotation = child.rotation.y + (Math.random() - 0.5) * Math.PI * 2
          child.walkCycle = 0
        } else {
          // 呼吸效果
          child.position.y = Math.sin(time * 2 + child.walkCycle) * 0.02
          // 轻微左右看
          child.rotation.y = child.targetRotation + Math.sin(time * 0.5 + child.walkCycle) * 0.1
        }
      } else {
        // 行走动画
        child.walkCycle += 0.1
        
        // 朝向目标旋转
        const targetRot = child.targetRotation
        child.rotation.y += (targetRot - child.rotation.y) * 0.05
        
        // 手臂摆动
        if (child.bodyParts.leftArm) {
          child.bodyParts.leftArm.rotation.x = Math.sin(child.walkCycle) * 0.3
        }
        if (child.bodyParts.rightArm) {
          child.bodyParts.rightArm.rotation.x = -Math.sin(child.walkCycle) * 0.3
        }
        
        // 腿部摆动
        if (child.bodyParts.leftLeg) {
          child.bodyParts.leftLeg.rotation.x = -Math.sin(child.walkCycle) * 0.3
        }
        if (child.bodyParts.rightLeg) {
          child.bodyParts.rightLeg.rotation.x = Math.sin(child.walkCycle) * 0.3
        }
        
        // 移动
        const moveDir = new THREE.Vector3(
          Math.sin(child.rotation.y),
          0,
          Math.cos(child.rotation.y)
        )
        child.position.add(moveDir.multiplyScalar(0.03))
        
        // 限制移动范围
        child.position.x = Math.max(-18, Math.min(18, child.position.x))
        child.position.z = Math.max(-18, Math.min(18, child.position.z))
        
        // 随机改变方向或进入待机
        if (Math.random() < 0.01) {
          child.isIdle = true
          child.idleTime = Math.random() * 3 + 2
          child.targetRotation = child.rotation.y
        }
      }
    }
  })

  // 鸟动画
  birds.forEach((bird, i) => {
    const time = Date.now() * 0.001
    bird.position.x += Math.sin(time + i) * 0.05
    bird.position.z += Math.cos(time + i) * 0.05
    bird.position.y += Math.sin(time * 2 + i) * 0.02

    const leftWing = bird.children[1]
    const rightWing = bird.children[2]
    if (leftWing && rightWing) {
      leftWing.rotation.z = Math.PI / 4 + Math.sin(time * 8 + i) * 0.3
      rightWing.rotation.z = -Math.PI / 4 - Math.sin(time * 8 + i) * 0.3
    }

    if (Math.abs(bird.position.x) > 40) bird.position.x *= -0.9
    if (Math.abs(bird.position.z) > 40) bird.position.z *= -0.9
  })

  // 雨滴动画
  if (rainParticles) {
    const positions = rainParticles.geometry.attributes.position.array as Float32Array
    for (let i = 1; i < positions.length; i += 3) {
      positions[i] -= 0.5
      if (positions[i] < 0) {
        positions[i] = 50
      }
    }
    rainParticles.geometry.attributes.position.needsUpdate = true
  }

  renderer.render(scene, camera)
}

function checkZones() {
  let nearestZone = null
  let nearestDistance = Infinity

  zones.forEach(zone => {
    const distance = Math.sqrt(
      Math.pow(character.position.x - zone.position.x, 2) +
      Math.pow(character.position.z - zone.position.z, 2)
    )

    if (distance < 2 && distance < nearestDistance) {
      nearestZone = zone
      nearestDistance = distance
    }
  })

  currentZone.value = nearestZone
}

const handleExit = () => {
  router.push('/')
}

function setTimeOfDay(time: 'day' | 'night') {
  timeOfDay.value = time

  const sun = (scene as any).sun
  const moon = (scene as any).moon
  const stars = (scene as any).stars

  if (time === 'day') {
    skyMaterial.uniforms.topColor.value = new THREE.Color(0x0077ff)
    skyMaterial.uniforms.bottomColor.value = new THREE.Color(0xffffff)
    scene.fog = new THREE.Fog(0x87CEEB, 30, 100)

    sunLight.intensity = 1.5
    sunLight.color = new THREE.Color(0xffffff)
    sunLight.position.set(50, 50, 50)

    ambientLight.intensity = 0.6
    ambientLight.color = new THREE.Color(0xffffff)
    hemiLight.intensity = 0.5
    hemiLight.color = new THREE.Color(0x87CEEB)
    hemiLight.groundColor = new THREE.Color(0x7ec850)

    if (sun) sun.visible = true
    if (moon) moon.visible = false
    if (stars) stars.visible = false

    messageService.success('☀️ 切换到白天模式')
  } else {
    skyMaterial.uniforms.topColor.value = new THREE.Color(0x000033)
    skyMaterial.uniforms.bottomColor.value = new THREE.Color(0x000055)
    scene.fog = new THREE.Fog(0x000033, 20, 80)

    sunLight.intensity = 0.3
    sunLight.color = new THREE.Color(0xaaaaff)
    sunLight.position.set(-50, 50, -50)

    ambientLight.intensity = 0.2
    ambientLight.color = new THREE.Color(0x4444ff)
    hemiLight.intensity = 0.1
    hemiLight.color = new THREE.Color(0x000033)
    hemiLight.groundColor = new THREE.Color(0x001100)

    if (sun) sun.visible = false
    if (moon) moon.visible = true
    if (stars) stars.visible = true

    messageService.success('🌙 切换到夜晚模式')
  }
}

function toggleRain() {
  isRaining.value = !isRaining.value

  if (isRaining.value) {
    // 创建雨滴
    const rainGeometry = new THREE.BufferGeometry()
    const rainVertices = []

    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 100
      const y = Math.random() * 50
      const z = (Math.random() - 0.5) * 100
      rainVertices.push(x, y, z)
    }

    rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainVertices, 3))

    const rainMaterial = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    })

    rainParticles = new THREE.Points(rainGeometry, rainMaterial)
    scene.add(rainParticles)

    // 调整光照
    skyMaterial.uniforms.topColor.value = new THREE.Color(0x555555)
    skyMaterial.uniforms.bottomColor.value = new THREE.Color(0x888888)
    scene.fog = new THREE.Fog(0x888888, 20, 60)

    messageService.success('🌧️ 开始下雨')
  } else {
    // 移除雨滴
    if (rainParticles) {
      scene.remove(rainParticles)
      rainParticles.geometry.dispose()
      ;(rainParticles.material as THREE.Material).dispose()
      rainParticles = null
    }

    // 恢复光照
    setTimeOfDay(timeOfDay.value)

    messageService.success('☁️ 雨停了')
  }
}
</script>

<style scoped>
.campus-3d-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 加载屏幕 - 动森风格 */
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffd4e5 0%, #b8e6ff 50%, #c9f0c9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: gradient-shift 8s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% {
    background: linear-gradient(135deg, #ffd4e5 0%, #b8e6ff 50%, #c9f0c9 100%);
  }
  33% {
    background: linear-gradient(135deg, #b8e6ff 0%, #c9f0c9 50%, #ffd4e5 100%);
  }
  66% {
    background: linear-gradient(135deg, #c9f0c9 0%, #ffd4e5 50%, #b8e6ff 100%);
  }
}

.loading-content {
  text-align: center;
  position: relative;
}

.loading-icon {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 40px;
}

.island {
  font-size: 80px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: bounce 2s ease-in-out infinite;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
}

@keyframes bounce {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-20px);
  }
}

.leaf {
  position: absolute;
  font-size: 40px;
  animation: rotate-leaf 3s linear infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
}

.leaf-1 {
  top: 0;
  left: 50%;
  transform-origin: center;
  animation-delay: 0s;
}

.leaf-2 {
  top: 50%;
  left: 0;
  transform-origin: center;
  animation-delay: 1s;
}

.leaf-3 {
  top: 50%;
  right: 0;
  transform-origin: center;
  animation-delay: 2s;
}

@keyframes rotate-leaf {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) translateX(60px) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) translateX(60px) rotate(-360deg);
  }
}

.loading-text h2 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 24px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
  animation: text-glow 2s ease-in-out infinite;
}

@keyframes text-glow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.loading-bar {
  width: 300px;
  height: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  overflow: hidden;
  margin: 0 auto 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1),
              inset 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #ff6b9d 0%, #ffd700 50%, #87ceeb 100%);
  border-radius: 20px;
  transition: width 0.3s ease;
  box-shadow: 0 0 20px rgba(255, 107, 157, 0.6);
  animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% {
    background-position: -300px 0;
  }
  100% {
    background-position: 300px 0;
  }
}

.loading-tip {
  font-size: 18px;
  color: #34495e;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.loading-decorations {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.deco {
  position: absolute;
  font-size: 30px;
  animation: float-deco 4s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.deco:nth-child(1) {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.deco:nth-child(2) {
  top: 15%;
  right: 15%;
  animation-delay: 1s;
}

.deco:nth-child(3) {
  bottom: 20%;
  left: 20%;
  animation-delay: 2s;
}

.deco:nth-child(4) {
  bottom: 15%;
  right: 10%;
  animation-delay: 3s;
}

@keyframes float-deco {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

.fade-out-enter-active,
.fade-out-leave-active {
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.fade-out-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fade-out-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 控制提示 - 美化版 */
.controls-hint {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 16px;
  pointer-events: auto;
  z-index: 10;
  animation: slide-in-left 0.6s ease-out;
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(255, 182, 217, 0.95) 0%, rgba(184, 230, 255, 0.95) 100%);
  padding: 12px 20px;
  border-radius: 20px;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 
              0 0 0 1px rgba(255, 255, 255, 0.3) inset;
  transition: all 0.3s ease;
}

.hint-item:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 40px rgba(255, 107, 157, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  border-color: rgba(255, 107, 157, 0.8);
}

.key {
  background: linear-gradient(135deg, #ff6b9d 0%, #ffd700 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.5),
              0 0 0 1px rgba(255, 255, 255, 0.3) inset;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.key:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5),
              0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}

.desc {
  color: #2c3e50;
  font-size: 15px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* 交互提示 - 美化版 */
.interaction-prompt {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 24px;
  background: linear-gradient(135deg, rgba(255, 244, 224, 0.98) 0%, rgba(255, 228, 196, 0.98) 100%);
  padding: 28px 48px;
  border-radius: 24px;
  backdrop-filter: blur(30px);
  border: 3px solid #ffd700;
  box-shadow: 0 12px 48px rgba(255, 215, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.5) inset,
              0 0 60px rgba(255, 215, 0, 0.3);
  pointer-events: auto;
  animation: pulse-cute 2s ease-in-out infinite;
  z-index: 100;
}

@keyframes pulse-cute {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 12px 48px rgba(255, 215, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.5) inset,
                0 0 60px rgba(255, 215, 0, 0.3);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
    box-shadow: 0 16px 56px rgba(255, 215, 0, 0.6),
                0 0 0 1px rgba(255, 255, 255, 0.7) inset,
                0 0 80px rgba(255, 215, 0, 0.5);
  }
}

.prompt-icon {
  font-size: 56px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.prompt-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prompt-title {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
  letter-spacing: 0.5px;
}

.prompt-action {
  color: #ff6b9d;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* 小地图 - 美化版 */
.minimap {
  position: absolute;
  top: 80px;
  right: 20px;
  width: 220px;
  height: 220px;
  background: linear-gradient(135deg, rgba(255, 244, 224, 0.95) 0%, rgba(201, 240, 201, 0.95) 100%);
  border-radius: 20px;
  border: 3px solid rgba(255, 215, 0, 0.8);
  backdrop-filter: blur(20px);
  overflow: hidden;
  pointer-events: auto;
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  z-index: 10;
  animation: slide-in-right 0.6s ease-out;
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.minimap::before {
  content: '🗺️ 地图';
  position: absolute;
  top: 10px;
  left: 14px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 700;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* 昼夜切换 - 美化版 */
.time-control {
  position: absolute;
  top: 20px;
  right: 20px;
  pointer-events: auto;
  z-index: 10;
}

.time-control :deep(.n-space) {
  background: linear-gradient(135deg, rgba(255, 228, 196, 0.95) 0%, rgba(176, 224, 230, 0.95) 100%);
  padding: 14px;
  border-radius: 20px;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 215, 0, 0.6);
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
  animation: slide-in-right 0.6s ease-out 0.2s both;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

.time-control :deep(.n-button) {
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.time-control :deep(.n-button--primary-type) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.time-control :deep(.n-button):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.minimap-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.minimap-character {
  position: absolute;
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 12px #FF6B35,
              0 0 20px rgba(255, 107, 53, 0.5),
              0 0 0 2px rgba(255, 255, 255, 0.3);
  z-index: 3;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 0 12px #FF6B35,
                0 0 20px rgba(255, 107, 53, 0.5),
                0 0 0 2px rgba(255, 255, 255, 0.3);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    box-shadow: 0 0 16px #FF6B35,
                0 0 30px rgba(255, 107, 53, 0.7),
                0 0 0 3px rgba(255, 255, 255, 0.5);
  }
}

.minimap-zone {
  position: absolute;
  width: 14px;
  height: 14px;
  background: rgba(102, 126, 234, 0.6);
  border: 2px solid #667eea;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.4);
}

.minimap-zone.active {
  background: rgba(255, 107, 53, 0.9);
  border-color: #FF6B35;
  box-shadow: 0 0 20px #FF6B35,
              0 0 30px rgba(255, 107, 53, 0.6);
  transform: translate(-50%, -50%) scale(1.4);
  animation: pulse-zone 1.5s ease-in-out infinite;
}

@keyframes pulse-zone {
  0%, 100% {
    box-shadow: 0 0 20px #FF6B35,
                0 0 30px rgba(255, 107, 53, 0.6);
  }
  50% {
    box-shadow: 0 0 25px #FF6B35,
                0 0 40px rgba(255, 107, 53, 0.8);
  }
}

/* 退出按钮 - 美化版 */
.exit-button {
  position: absolute;
  top: 20px;
  left: 20px;
  pointer-events: auto;
  z-index: 10;
}

.exit-button :deep(.n-button) {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.9) 0%, rgba(192, 57, 43, 0.9) 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(231, 76, 60, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  transition: all 0.3s ease;
}

.exit-button :deep(.n-button):hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(231, 76, 60, 0.6),
              0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}

/* 帮助按钮 - 美化版 */
.help-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  pointer-events: auto;
  z-index: 10;
}

.help-button :deep(.n-button) {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.9) 0%, rgba(41, 128, 185, 0.9) 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  transition: all 0.3s ease;
}

.help-button :deep(.n-button):hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(52, 152, 219, 0.6),
              0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}

/* 帮助内容 */
.help-content h3 {
  color: #667eea;
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 18px;
}

.help-content h3:first-child {
  margin-top: 0;
}

.help-content ul {
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
}

.help-content li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.help-content li:last-child {
  border-bottom: none;
}

.help-content strong {
  color: #FF6B35;
  margin-right: 8px;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .controls-hint {
    bottom: 10px;
    left: 10px;
    flex-direction: column;
    gap: 8px;
  }

  .minimap {
    width: 120px;
    height: 120px;
    top: 70px;
    right: 10px;
  }

  .time-control {
    top: 10px;
    right: 10px;
  }

  .interaction-prompt {
    padding: 16px 24px;
  }

  .prompt-icon {
    font-size: 36px;
  }

  .prompt-title {
    font-size: 16px;
  }

  .exit-button,
  .help-button {
    transform: scale(0.8);
  }

  .exit-button {
    top: 10px;
    left: 10px;
  }

  .help-button {
    bottom: 10px;
    right: 10px;
  }
}
</style>


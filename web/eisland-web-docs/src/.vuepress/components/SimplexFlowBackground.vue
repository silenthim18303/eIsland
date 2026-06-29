<template>
  <div class="simplex-flow-background" aria-hidden="true">
    <canvas ref="canvasRef" class="simplex-flow-background__canvas" />
    <div class="simplex-flow-background__glass" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { FIELD_SCALE, POINTER_RADIUS, SAMPLE_RATIO } from '../config/simplexFlow.js'
import { type PointerState } from '../types/simplexFlow.js'
import {
  clamp,
  drawPointerCaustics,
  fbm,
  samplePalette,
  simplexNoise,
} from '../utils/simplexFlow.js'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const pointer: PointerState = { x: 0, y: 0, active: false, influence: 0 }

let animationId = 0
let resizeHandler: (() => void) | undefined
let movePointerHandler: ((event: PointerEvent) => void) | undefined
let leavePointerHandler: (() => void) | undefined

onMounted(() => {
  const canvas = canvasRef.value
  const context = canvas?.getContext('2d', { alpha: false })
  const buffer = document.createElement('canvas')
  const bufferContext = buffer.getContext('2d', { alpha: false })

  if (!canvas || !context || !bufferContext) {
    return
  }

  let width = 0
  let height = 0
  let bufferWidth = 0
  let bufferHeight = 0
  let imageData = bufferContext.createImageData(1, 1)
  const originTime = performance.now()

  resizeHandler = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    width = window.innerWidth
    height = window.innerHeight
    bufferWidth = Math.max(96, Math.ceil(width * SAMPLE_RATIO))
    bufferHeight = Math.max(64, Math.ceil(height * SAMPLE_RATIO))
    canvas.width = Math.floor(width * ratio)
    canvas.height = Math.floor(height * ratio)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    buffer.width = bufferWidth
    buffer.height = bufferHeight
    imageData = bufferContext.createImageData(bufferWidth, bufferHeight)
  }

  movePointerHandler = (event: PointerEvent) => {
    pointer.x = event.clientX
    pointer.y = event.clientY
    pointer.active = true
  }

  leavePointerHandler = () => {
    pointer.active = false
  }

  const render = (time: number) => {
    const flowTime = (time - originTime) * 0.00016
    const data = imageData.data
    pointer.influence += ((pointer.active ? 1 : 0) - pointer.influence) * 0.055

    for (let y = 0; y < bufferHeight; y += 1) {
      const screenY = y / SAMPLE_RATIO

      for (let x = 0; x < bufferWidth; x += 1) {
        const screenX = x / SAMPLE_RATIO
        let sampleX = screenX
        let sampleY = screenY

        if (pointer.influence > 0.01) {
          const dx = pointer.x - screenX
          const dy = pointer.y - screenY
          const distance = Math.hypot(dx, dy)

          if (distance < POINTER_RADIUS && distance > 0.01) {
            const pull = (1 - distance / POINTER_RADIUS) ** 2 * pointer.influence
            const angle = Math.atan2(dy, dx)
            const swirl = pull * 32
            sampleX += Math.cos(angle) * pull * 82 - Math.sin(angle) * swirl
            sampleY += Math.sin(angle) * pull * 82 + Math.cos(angle) * swirl
          }
        }

        const domainWarpX = simplexNoise(sampleX * FIELD_SCALE + 12.6 + flowTime * 0.36, sampleY * FIELD_SCALE - 7.8) * 112
        const domainWarpY = simplexNoise(sampleX * FIELD_SCALE - 3.4, sampleY * FIELD_SCALE + 8.2 - flowTime * 0.32) * 112
        const flow = fbm((sampleX + domainWarpX) * FIELD_SCALE, (sampleY + domainWarpY) * FIELD_SCALE, flowTime)
        const warm = simplexNoise(sampleX * 0.00086 - flowTime * 0.12, sampleY * 0.00086 + flowTime * 0.1)
        const value = clamp(0.5 + flow * 0.2 + warm * 0.08, 0, 1)
        const color = samplePalette(value)
        const mist = 0.94 + simplexNoise(sampleX * 0.0032 + flowTime * 0.34, sampleY * 0.0032 - flowTime * 0.3) * 0.035
        const index = (y * bufferWidth + x) * 4

        data[index] = clamp(color[0] * mist, 0, 255)
        data[index + 1] = clamp(color[1] * mist, 0, 255)
        data[index + 2] = clamp(color[2] * mist, 0, 255)
        data[index + 3] = 255
      }
    }

    bufferContext.putImageData(imageData, 0, 0)
    context.clearRect(0, 0, width, height)
    context.drawImage(buffer, 0, 0, bufferWidth, bufferHeight, 0, 0, width, height)
    drawPointerCaustics(context, pointer, flowTime * 4)
    animationId = window.requestAnimationFrame(render)
  }

  resizeHandler()
  window.addEventListener('resize', resizeHandler)
  window.addEventListener('pointermove', movePointerHandler)
  window.addEventListener('pointerleave', leavePointerHandler)
  animationId = window.requestAnimationFrame(render)
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationId)

  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (movePointerHandler) window.removeEventListener('pointermove', movePointerHandler)
  if (leavePointerHandler) window.removeEventListener('pointerleave', leavePointerHandler)
})
</script>

<style>
@import '../styles/simplex-flow.scss';
</style>

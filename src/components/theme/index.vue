<template>
  <div class="theme-change-container">
    <div class="btn_switch_theme" @click="switchMode(getThemeMode())">系统</div>
    <div class="btn_switch_theme" @click="switchMode('light')">🌞浅色</div>
    <div class="btn_switch_theme" @click="switchMode('dark')">🌚深色</div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import { getStorageItem, setStorageItem } from '@/utils/storage'
const LOCAL_THEME_MODE = 'theme-mode'

// 获取本地主题配置
const getStorage = (localKey: string) => {
  const value = getStorageItem(localKey)
  return value ? value : getThemeMode()
}

// 保存本地主题配置
const setStorage = (localKey: string, value: string) => {
  setStorageItem(localKey, value)
}

// 获取系统主题模式
const getThemeMode = () => {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

// 监听浏览器（系统）主题变化
const matchMediaHandler = window.matchMedia('(prefers-color-scheme: light)')
matchMediaHandler.addEventListener('change', () => {
  switchMode(getStorage(LOCAL_THEME_MODE))
})

// 切换主题
const switchMode = (theme: string) => {
  const doc = document.querySelector('body')
  if (doc) {
    doc.removeAttribute('class')
    theme && doc.classList.add(theme)
    setStorage(LOCAL_THEME_MODE, theme)
  }
}
switchMode(getStorage(LOCAL_THEME_MODE))

// 移除监听
onUnmounted(() => {
  matchMediaHandler.removeEventListener('change', () => {
    switchMode(getStorage(LOCAL_THEME_MODE))
  })
})
</script>

<style lang="scss" scoped>
.theme-change-container {
  width: 40px;
  border-radius: 4px;
  overflow: hidden;
  padding: 4px;
  background-color: var(--sc-color-background-2);
  .btn_switch_theme {
    width: 100%;
    border: none;
    padding: 8px 6px;
    color: var(--sc-color-font-1);
  }

  .btn_switch_theme:hover {
    background-color: var(--sc-color-background-3);
    border-radius: 4px;
    cursor: pointer;
  }
}
</style>

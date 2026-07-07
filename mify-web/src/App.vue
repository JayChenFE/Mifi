<template>
  <div class="app-layout">
    <el-menu
      :default-active="currentRoute"
      router
      class="app-sidebar"
      background-color="transparent"
      text-color="var(--text-sidebar)"
      active-text-color="var(--text-sidebar-active)"
    >
      <div class="sidebar-title">Mify</div>
      <el-menu-item index="/chat">
        <el-icon><ChatDotRound /></el-icon>
        <span>对话</span>
      </el-menu-item>
      <el-menu-item index="/providers">
        <el-icon><Cpu /></el-icon>
        <span>模型管理</span>
      </el-menu-item>
      <el-menu-item index="/agents">
        <el-icon><UserFilled /></el-icon>
        <span>Agent 管理</span>
      </el-menu-item>
    </el-menu>
    <div class="app-main">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChatDotRound, Cpu, UserFilled } from '@element-plus/icons-vue'

const route = useRoute()
const currentRoute = computed(() => route.path)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--text-primary);
  background-color: var(--bg-page);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ====== Layout ====== */
.app-layout {
  display: flex;
  height: 100vh;
}

/* ====== Sidebar ====== */
.app-sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background-color: var(--bg-sidebar) !important;
  border-right: none !important;
}

.sidebar-title {
  height: 56px;
  line-height: 56px;
  text-align: center;
  color: var(--text-inverse);
  font-size: var(--font-size-xl);
  font-weight: 700;
  letter-spacing: -0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

/* Sidebar menu items */
.app-sidebar .el-menu-item {
  position: relative;
  margin: 2px 8px;
  border-radius: var(--radius-md);
  height: 40px;
  line-height: 40px;
  font-size: var(--font-size-base);
  transition: background-color var(--transition-fast);
  overflow: visible;
}

.app-sidebar .el-menu-item .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.app-sidebar .el-menu-item:hover {
  background-color: var(--bg-sidebar-hover) !important;
}

.app-sidebar .el-menu-item.is-active {
  background-color: var(--bg-sidebar-active) !important;
  color: var(--text-sidebar-active) !important;
}

/* 左侧选中指示条 */
.app-sidebar .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 0 3px 3px 0;
  background: var(--color-brand);
}

/* ====== Main Content ====== */
.app-main {
  flex: 1;
  padding: var(--page-padding);
  overflow-y: auto;
  background-color: var(--bg-page);
}
</style>

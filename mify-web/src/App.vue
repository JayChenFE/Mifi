<template>
  <div class="app-layout">
    <el-menu
      :default-active="currentRoute"
      router
      class="app-sidebar"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
    >
      <div class="sidebar-title">Mify</div>
      <el-menu-item index="/chat">
        <span>对话</span>
      </el-menu-item>
      <el-menu-item index="/providers">
        <span>模型管理</span>
      </el-menu-item>
      <el-menu-item index="/agents">
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

const route = useRoute()
const currentRoute = computed(() => route.path)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-layout {
  display: flex;
  height: 100vh;
}

.app-sidebar {
  width: 220px;
  flex-shrink: 0;
}

.sidebar-title {
  height: 56px;
  line-height: 56px;
  text-align: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>

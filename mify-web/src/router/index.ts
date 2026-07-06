import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/chat',
  },
  {
    path: '/provider',
    name: 'Provider',
    component: () => import('@/views/provider/index.vue'),
  },
  {
    path: '/agent',
    name: 'Agent',
    component: () => import('@/views/agent/index.vue'),
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/chat/index.vue'),
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('@/views/knowledge/index.vue'),
  },
  {
    path: '/workflow',
    name: 'Workflow',
    component: () => import('@/views/workflow/index.vue'),
  },
  {
    path: '/mcp',
    name: 'Mcp',
    component: () => import('@/views/mcp/index.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

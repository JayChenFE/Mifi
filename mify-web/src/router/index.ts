import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/chat',
  },
  {
    path: '/providers',
    name: 'Provider',
    component: () => import('@/views/provider/index.vue'),
  },
  {
    path: '/agents',
    name: 'Agent',
    component: () => import('@/views/agent/index.vue'),
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/chat/index.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

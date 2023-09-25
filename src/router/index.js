// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        alias: ['Home','Register'],
        component: () => import('@/views/RegisterView.vue'),
      },
      {
        path: '/game',
        name: 'Game',
        component: () => import('@/views/GameView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router

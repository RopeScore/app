import { createWebHistory, createRouter } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/Home.vue') },
    { path: '/practice', component: () => import('./views/PracticeIndex.vue') },
    { path: '/score/:id', component: () => import('./views/Score.vue') }
  ]
})

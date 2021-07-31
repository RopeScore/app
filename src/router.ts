import { createWebHistory, createRouter } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: async () => import('./views/Home.vue') },
    { path: '/practice', component: async () => import('./views/PracticeIndex.vue') },
    { path: '/groups', component: async () => import('./views/Groups.vue') },
    { path: '/groups/:id', component: async () => import('./views/Group.vue') },
    { path: '/score/:id', component: async () => import('./views/Score.vue') }
  ]
})

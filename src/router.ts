import { createWebHistory, createRouter } from 'vue-router'
import { useServoAuth } from './hooks/servo-auth'
import { useAuth } from './hooks/auth'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: async () => import('./views/Home.vue') },
    { path: '/practice', component: async () => import('./views/PracticeIndex.vue') },
    { path: '/score/:system/:vendor+', component: async () => import('./views/Score.vue') },

    // RopeScore
    { path: '/rs/groups', component: async () => import('./views/ropescore/Groups.vue') },
    {
      path: '/rs/groups/:id',
      component: async () => import('./views/ropescore/Group.vue'),
      beforeEnter: (to, fron) => {
        const { token } = useAuth()
        if (token.value == null) return { path: '/rs/groups' }
      }
    },
    { path: '/rs/device-shares', component: async () => import('./views/ropescore/DeviceShare.vue') },

    // IJRU
    { path: '/servo/connect', component: async () => import('./views/servo/Connect.vue') },
    {
      path: '/servo/entries',
      component: async () => import('./views/servo/Entries.vue'),
      beforeEnter: (to, fron) => {
        const { token } = useServoAuth()
        if (token.value == null) return { path: '/servo/connect' }
      }
    }
  ]
})

import { createWebHistory, createRouter } from 'vue-router'
import { useServoAuth } from './hooks/servo-auth'
import { useAuth } from './hooks/auth'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: async () => await import('./views/Home.vue') },
    { path: '/practice', component: async () => await import('./views/PracticeIndex.vue') },
    { path: '/score/:system/:vendor+', component: async () => await import('./views/Score.vue'), meta: { disableModals: true } },
    { path: '/scoresheets', component: async () => await import('./views/ScoresheetsList.vue') },
    { path: '/scoresheets/:system/:vendor+/marks', component: async () => await import('./views/ScoresheetMarks.vue') },

    // RopeScore
    { path: '/rs/groups', component: async () => await import('./views/ropescore/Groups.vue') },
    {
      path: '/rs/groups/:id',
      component: async () => await import('./views/ropescore/Group.vue'),
      beforeEnter: (to, fron) => {
        const { token } = useAuth()
        if (token.value == null) return { path: '/rs/groups' }
      }
    },
    { path: '/rs/device-shares', component: async () => await import('./views/ropescore/DeviceShare.vue') },

    // IJRU
    { path: '/servo/connect', component: async () => await import('./views/servo/Connect.vue') },
    {
      path: '/:type([a|s])/:code',
      redirect: to => ({
        path: '/servo/connect',
        query: {
          type: to.params.type,
          code: to.params.code,
          'base-url': to.query['base-url'],
        }
      }),
    },
    {
      path: '/servo/entries',
      component: async () => await import('./views/servo/Entries.vue'),
      beforeEnter: (to, fron) => {
        const { token } = useServoAuth()
        if (token.value == null) return { path: '/servo/connect' }
      }
    }
  ]
})

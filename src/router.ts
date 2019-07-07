import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/difficulty',
      name: 'difficulty',
      component: () => import(/* webpackChunkName: "difficulty" */ './views/Difficulty.vue')
    },
    {
      path: '/presentation/athlete',
      name: 'presentation.athlete',
      component: () => import(/* webpackChunkName: "presentation.athlete" */ './views/PresentationAthlete.vue')
    },
    {
      path: '/presentation/routine',
      name: 'presentation.routine',
      component: () => import(/* webpackChunkName: "presentation.routine" */ './views/PresentationRoutine.vue')
    },
    {
      path: '/deductions/sr',
      name: 'deductions.sr',
      component: () => import(/* webpackChunkName: "deductions.sr" */ './views/DeductionsSR.vue')
    },
    {
      path: '/deductions/dd',
      name: 'deductions.dd',
      component: () => import(/* webpackChunkName: "deductions.dd" */ './views/DeductionsDD.vue')
    }
  ]
})

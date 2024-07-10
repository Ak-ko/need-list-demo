import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'
import NotFound from '@/views/NotFound.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth/login',
      component: GuestLayout,
      children: [
        {
          path: '',
          name: 'login',
          component: Login,
          meta: {
            requiresAuth: false
          }
        }
      ]
    },
    {
      path: '/auth/register',
      component: GuestLayout,
      children: [
        {
          path: '',
          name: 'register',
          component: Register,
          meta: {
            requiresAuth: false
          }
        }
      ]
    },
    {
      path: '/',
      component: UserLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: Home,
          meta: {
            requiresAuth: true
          }
        }
      ]
    },
    {
      path: '/:catchAll(.*)',
      component: NotFound
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const store = useAuthStore()
  const isAuthenticated = store?.getUser

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (!to.meta.requiresAuth && isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router

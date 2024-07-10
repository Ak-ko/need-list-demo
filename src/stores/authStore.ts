import { useLocalStorage } from '@/composables/index'
import { defineStore } from 'pinia'

interface UserType {
  id: string
  email: string
}

interface AuthStateType {
  user: UserType | null
}

const storage = useLocalStorage('auth')

export const useAuthStore = defineStore('auth', {
  state: (): AuthStateType => ({ user: storage?.getItem() || null }),
  getters: {
    getUser: (state: AuthStateType) => state?.user
  },
  actions: {
    login(context: UserType) {
      this.user = { ...context }
      storage.setItem(context)
    },
    logout() {
      this.user = null
      storage.removeItem()
    }
  }
})

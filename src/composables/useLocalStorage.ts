export const useLocalStorage = (key: string) => {
  return {
    getItem: () => JSON.parse(localStorage.getItem(key) as string),
    setItem: (value: string | Object) => {
      if (typeof value !== 'object') {
        return localStorage.setItem(key, value)
      } else {
        return localStorage.setItem(key, JSON.stringify(value))
      }
    },
    removeItem: () => localStorage.removeItem(key),
    removeAll: () => localStorage.clear()
  }
}

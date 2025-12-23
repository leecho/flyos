import { reactive } from 'vue'

export interface User {
  id: string           // 唯一 id
  name: string
  avatar: string
  locked: boolean
}

export const userStore = reactive<User>({
  user: {
    id: '1',
    name: 'FlyOS User',
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    locked: false
  }
})

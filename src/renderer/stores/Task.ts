import { defineStore } from 'pinia'

/**
 * Milliseconde en minute
 */
const MINUTE = 60 * 1000

/**
 * Entité 'Tâches'
 */
export interface Task {
  id: number
  stage: string
  version: string
  description: string
  title: string
  redmine?: number
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface TaskState {
  tasks: Record<number, CacheEntry<Task>>
  allTasks: CacheEntry<Task[]> | null
  ttl: number
  lastFetch: number | null
  baseUrl: string
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks: {},
    allTasks: null,
    ttl: 5 * MINUTE,
    lastFetch: null,
    baseUrl: 'http://localhost:3000',
  }),
  getters: {
    getTaskById: (state) => {
      return (id: number): Task | null => {
        const task = state.tasks[id]
        if (!task) return null
        const isExpired = Date.now() - task.timestamp > state.ttl
        return isExpired ? null : task.data
      }
    }
  },
  actions: {
    setTaskCache(id: number, data: Task) {
      this.tasks[id] = { data, timestamp: Date.now() }
    },

    setAllTasksCache(data: Task[]) {
      this.allTasks = { data, timestamp: Date.now() }
      this.lastFetch = Date.now()
    },

    isCacheValid<T>(cache: CacheEntry<T> | null): boolean {
      if (!cache) return false
      return Date.now() - cache.timestamp <= this.ttl
    },

    /**
     * Récupération d'une tâche par id
     * @returns une tâche
     */
    async fetchTask(id: number): Promise<Task> {
      const cached = this.getTaskById(id)
      if (cached) return cached

      const res = await fetch(`${this.baseUrl}/tasks/${id}`)
      const data: Task = await res.json()
      this.setTaskCache(data.id, data)
      return data
    },

    /**
     * Récupération de toutes les tâches
     * @returns Toutes les tâches
     */
    async fetchAllTasks(): Promise<Task[]> {
      if (this.isCacheValid(this.allTasks)) {
        return this.allTasks!.data
      }

      const res = await fetch(`${this.baseUrl}/tasks`)
      const data: Task[] = await res.json()
      this.setAllTasksCache(data)
      return data
    },
  }
})
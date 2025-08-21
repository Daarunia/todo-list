<template>
  <div class="drag-container">
    <ul class="drag-list">

      <!-- Affichage des colonnes -->
      <li v-for="stage in stages" :key="stage" class="drag-column bg-gray-700">
        <h2 class="mx-[3%] mb-[3%]">{{ stage }}</h2>

        <!-- Affichage des tâches par colonne -->
        <draggable
          :list="getTasksByStage(stage)"
          group="tasks"
          item-key="id"
          class="drag-inner-list"
          @end="onTaskDrop"
        >
          <template #item="{ element }">
            <div class="drag-item bg-gray-600" :data-id="element.id">
              <strong>{{ element.title }}</strong>
            </div>
          </template>
        </draggable>

        <div class="drag-column-footer">
          <slot :name="`footer-${stage}`"></slot>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { useLogger } from 'vue-logger-plugin'
import type { Task } from '../stores/Task'

/**
 * Props typées
 */
const props = defineProps<{
  stages: string[]
  tasks: Task[]
}>()

/**
 * Logger
 */
const logger = useLogger()

/**
 * Liste locale des tâches
 */
const localTasks = ref<Task[]>([])

/**
 * Mise à jour des tâches reçu async
 */
watch(
  () => props.tasks,
  (newTasks) => {
    localTasks.value = [...newTasks]
  },
  { immediate: true, deep: true }
)

/**
 * Récupération des tâches par colonne
 */
function getTasksByStage(stage: string): Task[] {
  return localTasks.value.filter((task) => task.stage === stage)
}

/**
 * Fonction appelée quand une tâche est déplacée
 */
function onTaskDrop(evt: any) {
  const { item, to } = evt

  // Trouve la colonne où la tâche a été déposée
  const newStage = props.stages.find(
    (stage) =>
      to.closest('.drag-column').querySelector('h2')?.textContent === stage
  )

  if (newStage) {
    const movedTask = localTasks.value.find((t) => t.id == item.dataset.id)

    if (movedTask) {
      movedTask.stage = newStage
      logger.debug(
        `La tâche "${movedTask.title}" a été déplacée dans la colonne "${newStage}"`
      )
    }
  }
}
</script>

<style scoped>
.drag-container {
  display: flex;
  overflow-x: auto;
}

.drag-list {
  display: flex;
  gap: 1rem;
  padding: 0;
  list-style: none;
}

.drag-column {
  flex: 1;
  min-width: 250px;
  border-radius: 8px;
  padding: 1rem;
}

.drag-inner-list {
  min-height: 100px;
}

.drag-item {
  border-radius: 4px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: move;
}
</style>
'use client'

import { useState } from 'react'
import { Board, Task } from './Dashboard'

interface KanbanBoardProps {
  board: Board
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onUpdateTask: (id: number, updates: Partial<Task>) => void
}

export default function KanbanBoard({
  board,
  onAddTask,
  onEditTask,
  onUpdateTask,
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const columns = [
    { id: 'TODO', title: 'A Fazer', color: 'text-red-400' },
    { id: 'DOING', title: 'Em Andamento', color: 'text-yellow-400' },
    { id: 'DONE', title: 'Concluída', color: 'text-green-400' },
  ]

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: 'TODO' | 'DOING' | 'DONE') => {
    if (draggedTask && draggedTask.status !== status) {
      onUpdateTask(draggedTask.id, { status })
    }
    setDraggedTask(null)
  }

  const getTasksByStatus = (status: string) => {
    return board.tasks.filter((task) => task.status === status)
  }

  return (
    <div className="mt-8">
      <div className="kanban-board">
        {columns.map((column) => (
          <div
            key={column.id}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id as 'TODO' | 'DOING' | 'DONE')}
          >
            <div className="kanban-column-header">
              <div className="kanban-column-title">
                <span className={column.color}>●</span>
                <span>{column.title}</span>
                <span className="text-sm text-gray-400">
                  ({getTasksByStatus(column.id).length})
                </span>
              </div>

              {column.id === 'TODO' && (
                <button
                  onClick={onAddTask}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                  title="Adicionar tarefa"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {getTasksByStatus(column.id).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onEditTask(task)}
                  className={`task-card ${
                    draggedTask?.id === task.id ? 'task-card-dragging' : ''
                  }`}
                >
                  <h3 className="font-semibold mb-2">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-3 text-xs text-gray-500">
                    {new Date(task.updatedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}

              {getTasksByStatus(column.id).length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  Nenhuma tarefa
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Task } from './Dashboard'

interface TaskModalProps {
  task: Task | null
  onClose: () => void
  onSave: (task: Partial<Task>) => void
  onDelete?: () => void
}

export default function TaskModal({ task, onClose, onSave, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'TODO' | 'DOING' | 'DONE'>('TODO')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setStatus(task.status)
    } else {
      setTitle('')
      setDescription('')
      setStatus('TODO')
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSave({
        title: title.trim(),
        description: description.trim() || null,
        status,
      })
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">
          {task ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium mb-2">
              Título
            </label>
            <input
              type="text"
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="task-description" className="block text-sm font-medium mb-2">
              Descrição
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[100px]"
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="task-status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'TODO' | 'DOING' | 'DONE')}
              className="input-field"
            >
              <option value="TODO">A Fazer</option>
              <option value="DOING">Em Andamento</option>
              <option value="DONE">Concluída</option>
            </select>
          </div>

          <div className="flex gap-3 justify-between mt-6">
            <div>
              {task && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="btn-danger"
                >
                  Excluir
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {task ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

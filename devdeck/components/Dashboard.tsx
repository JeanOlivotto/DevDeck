'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from './Header'
import BoardList from './BoardList'
import KanbanBoard from './KanbanBoard'
import TaskModal from './TaskModal'
import BoardModal from './BoardModal'
import UserSettingsModal from './UserSettingsModal'

export interface Task {
  id: number
  title: string
  description?: string | null
  status: 'TODO' | 'DOING' | 'DONE'
  boardId: number
  createdAt: string
  updatedAt: string
}

export interface Board {
  id: number
  name: string
  tasks: Task[]
  userId: number
}

export default function Dashboard() {
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [currentBoardId, setCurrentBoardId] = useState<number | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showBoardModal, setShowBoardModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingBoard, setEditingBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  const currentBoard = boards.find((b) => b.id === currentBoardId)

  useEffect(() => {
    loadBoards()
    const name = localStorage.getItem('devdeck_user_name') || ''
    setUserName(name)
  }, [])

  const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('devdeck_auth_token')
    
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (response.status === 401) {
      localStorage.clear()
      router.push('/login')
      throw new Error('Não autorizado')
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro na requisição')
    }

    return response.status === 204 ? null : response.json()
  }

  const loadBoards = async () => {
    try {
      setLoading(true)
      const data = await fetchApi('/boards')
      setBoards(data)
      if (data.length > 0 && !currentBoardId) {
        setCurrentBoardId(data[0].id)
      }
    } catch (error: any) {
      console.error('Error loading boards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBoard = async (name: string) => {
    try {
      const newBoard = await fetchApi('/boards', {
        method: 'POST',
        body: JSON.stringify({ name }),
      })
      setBoards([...boards, newBoard])
      setCurrentBoardId(newBoard.id)
      setShowBoardModal(false)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleUpdateBoard = async (id: number, name: string) => {
    try {
      const updated = await fetchApi(`/boards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      })
      setBoards(boards.map((b) => (b.id === id ? updated : b)))
      setShowBoardModal(false)
      setEditingBoard(null)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleDeleteBoard = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este quadro?')) return

    try {
      await fetchApi(`/boards/${id}`, { method: 'DELETE' })
      setBoards(boards.filter((b) => b.id !== id))
      if (currentBoardId === id) {
        setCurrentBoardId(boards.length > 1 ? boards[0].id : null)
      }
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleCreateTask = async (task: Partial<Task>) => {
    if (!currentBoardId) return

    try {
      const newTask = await fetchApi('/tasks', {
        method: 'POST',
        body: JSON.stringify({ ...task, boardId: currentBoardId }),
      })
      
      setBoards(
        boards.map((b) =>
          b.id === currentBoardId ? { ...b, tasks: [...b.tasks, newTask] } : b
        )
      )
      setShowTaskModal(false)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
    try {
      const updated = await fetchApi(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })

      setBoards(
        boards.map((b) => ({
          ...b,
          tasks: b.tasks.map((t) => (t.id === id ? updated : t)),
        }))
      )
      setShowTaskModal(false)
      setEditingTask(null)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

    try {
      await fetchApi(`/tasks/${id}`, { method: 'DELETE' })
      setBoards(
        boards.map((b) => ({
          ...b,
          tasks: b.tasks.filter((t) => t.id !== id),
        }))
      )
      setShowTaskModal(false)
      setEditingTask(null)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <Header
        userName={userName}
        onLogout={handleLogout}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="max-w-7xl mx-auto mt-6">
        <BoardList
          boards={boards}
          currentBoardId={currentBoardId}
          onSelectBoard={setCurrentBoardId}
          onCreateBoard={() => setShowBoardModal(true)}
          onEditBoard={(board) => {
            setEditingBoard(board)
            setShowBoardModal(true)
          }}
          onDeleteBoard={handleDeleteBoard}
        />

        {currentBoard && (
          <KanbanBoard
            board={currentBoard}
            onAddTask={() => setShowTaskModal(true)}
            onEditTask={(task) => {
              setEditingTask(task)
              setShowTaskModal(true)
            }}
            onUpdateTask={handleUpdateTask}
          />
        )}

        {!currentBoard && boards.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-xl text-gray-400 mb-4">
              Nenhum quadro encontrado
            </p>
            <button
              onClick={() => setShowBoardModal(true)}
              className="btn-primary"
            >
              Criar Primeiro Quadro
            </button>
          </div>
        )}
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setShowTaskModal(false)
            setEditingTask(null)
          }}
          onSave={(task) => {
            if (editingTask) {
              handleUpdateTask(editingTask.id, task)
            } else {
              handleCreateTask(task)
            }
          }}
          onDelete={editingTask ? () => handleDeleteTask(editingTask.id) : undefined}
        />
      )}

      {showBoardModal && (
        <BoardModal
          board={editingBoard}
          onClose={() => {
            setShowBoardModal(false)
            setEditingBoard(null)
          }}
          onSave={(name) => {
            if (editingBoard) {
              handleUpdateBoard(editingBoard.id, name)
            } else {
              handleCreateBoard(name)
            }
          }}
        />
      )}

      {showSettings && (
        <UserSettingsModal
          onClose={() => setShowSettings(false)}
          fetchApi={fetchApi}
        />
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

interface BoardModalProps {
  board: { id: number; name: string } | null
  onClose: () => void
  onSave: (name: string) => void
}

export default function BoardModal({ board, onClose, onSave }: BoardModalProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (board) {
      setName(board.name)
    } else {
      setName('')
    }
  }, [board])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(name.trim())
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">
          {board ? 'Editar Quadro' : 'Novo Quadro'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="board-name" className="block text-sm font-medium mb-2">
              Nome do Quadro
            </label>
            <input
              type="text"
              id="board-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              autoFocus
              required
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {board ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

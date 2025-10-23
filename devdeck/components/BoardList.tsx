'use client'

import { Board } from './Dashboard'

interface BoardListProps {
  boards: Board[]
  currentBoardId: number | null
  onSelectBoard: (id: number) => void
  onCreateBoard: () => void
  onEditBoard: (board: Board) => void
  onDeleteBoard: (id: number) => void
}

export default function BoardList({
  boards,
  currentBoardId,
  onSelectBoard,
  onCreateBoard,
  onEditBoard,
  onDeleteBoard,
}: BoardListProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {boards.map((board) => (
          <div key={board.id} className="relative group flex-shrink-0">
            <button
              onClick={() => onSelectBoard(board.id)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                currentBoardId === board.id
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                  : 'bg-[#23284a] text-gray-300 hover:bg-[#2a2f4a]'
              }`}
            >
              {board.name}
            </button>
            
            {currentBoardId === board.id && (
              <div className="absolute -top-2 -right-2 flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditBoard(board)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Editar quadro"
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteBoard(board.id)
                  }}
                  className="bg-red-600 hover:bg-red-700 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Excluir quadro"
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={onCreateBoard}
          className="flex-shrink-0 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-md flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
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
          Novo Quadro
        </button>
      </div>
    </div>
  )
}

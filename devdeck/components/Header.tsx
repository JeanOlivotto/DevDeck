'use client'

import { useState } from 'react'
import Image from 'next/image'

interface HeaderProps {
  userName: string
  onLogout: () => void
  onOpenSettings: () => void
}

export default function Header({ userName, onLogout, onOpenSettings }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="w-full max-w-7xl mx-auto flex items-center justify-between mb-6 sm:mb-10 px-4">
      <div className="flex items-center flex-shrink-0">
        <Image
          src="/img/logo-DevDesck-removebg-preview.png"
          alt="DevDeck Logo"
          width={56}
          height={56}
          className="filter drop-shadow-[0_0_8px_rgba(162,89,255,0.7)]"
        />
        <Image
          src="/img/Nome-DevDesck-removebg-preview.png"
          alt="DevDeck"
          width={180}
          height={48}
          className="ml-2"
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 bg-[#23284a] p-2 rounded-lg border border-transparent hover:border-purple-500 transition-all"
        >
          <span className="font-semibold text-white hidden sm:inline">
            Olá, {userName}
          </span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold text-sm">
            {getInitials(userName)}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              showDropdown ? 'rotate-180' : ''
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-[#23284a] rounded-lg shadow-2xl border border-gray-700 z-50">
            <button
              onClick={() => {
                setShowDropdown(false)
                onOpenSettings()
              }}
              className="w-full text-left px-4 py-3 hover:bg-[#2a2f4a] transition-colors border-b border-gray-700"
            >
              Configurações
            </button>
            <button
              onClick={() => {
                setShowDropdown(false)
                onLogout()
              }}
              className="w-full text-left px-4 py-3 hover:bg-[#2a2f4a] transition-colors text-red-400"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

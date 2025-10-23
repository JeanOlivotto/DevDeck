'use client'

import { useState, useEffect } from 'react'

interface UserSettingsModalProps {
  onClose: () => void
  fetchApi: (endpoint: string, options?: RequestInit) => Promise<any>
}

export default function UserSettingsModal({ onClose, fetchApi }: UserSettingsModalProps) {
  const [settings, setSettings] = useState({
    email: '',
    name: '',
    notifyDailySummary: true,
    notifyStaleTasks: true,
    notifyViaWhatsApp: false,
    whatsappNumber: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await fetchApi('/user/settings')
      setSettings({
        email: data.email,
        name: data.name,
        notifyDailySummary: data.notifyDailySummary,
        notifyStaleTasks: data.notifyStaleTasks,
        notifyViaWhatsApp: data.notifyViaWhatsApp,
        whatsappNumber: data.whatsappNumber || '',
      })
    } catch (error: any) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await fetchApi('/user/update-settings', {
        method: 'PATCH',
        body: JSON.stringify({
          notifyDailySummary: settings.notifyDailySummary,
          notifyStaleTasks: settings.notifyStaleTasks,
          notifyViaWhatsApp: settings.notifyViaWhatsApp,
          whatsappNumber: settings.whatsappNumber || null,
        }),
      })
      alert('Configurações salvas com sucesso!')
      onClose()
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">Configurações</h2>

        <div className="space-y-6">
          {/* User Info */}
          <div className="p-4 bg-[#23284a] rounded-lg border-b border-gray-700">
            <p className="font-semibold text-white">{settings.name}</p>
            <p className="text-sm text-gray-400">{settings.email}</p>
          </div>

          {/* Email Notifications */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Notificações Email
            </h4>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Resumo Diário</span>
              <input
                type="checkbox"
                checked={settings.notifyDailySummary}
                onChange={(e) =>
                  setSettings({ ...settings, notifyDailySummary: e.target.checked })
                }
                className="sr-only toggle-checkbox"
              />
              <div className="relative">
                <div
                  className={`toggle-bg border-2 h-6 w-11 rounded-full transition-colors ${
                    settings.notifyDailySummary
                      ? 'bg-purple-600 border-purple-600'
                      : 'bg-gray-600 border-gray-600'
                  }`}
                >
                  <div
                    className={`toggle-dot absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      settings.notifyDailySummary ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Aviso de Tarefa Parada</span>
              <input
                type="checkbox"
                checked={settings.notifyStaleTasks}
                onChange={(e) =>
                  setSettings({ ...settings, notifyStaleTasks: e.target.checked })
                }
                className="sr-only toggle-checkbox"
              />
              <div className="relative">
                <div
                  className={`toggle-bg border-2 h-6 w-11 rounded-full transition-colors ${
                    settings.notifyStaleTasks
                      ? 'bg-purple-600 border-purple-600'
                      : 'bg-gray-600 border-gray-600'
                  }`}
                >
                  <div
                    className={`toggle-dot absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      settings.notifyStaleTasks ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
              </div>
            </label>
          </div>

          {/* WhatsApp Notifications */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Notificações WhatsApp
            </h4>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Receber via WhatsApp</span>
              <input
                type="checkbox"
                checked={settings.notifyViaWhatsApp}
                onChange={(e) =>
                  setSettings({ ...settings, notifyViaWhatsApp: e.target.checked })
                }
                className="sr-only toggle-checkbox"
              />
              <div className="relative">
                <div
                  className={`toggle-bg border-2 h-6 w-11 rounded-full transition-colors ${
                    settings.notifyViaWhatsApp
                      ? 'bg-purple-600 border-purple-600'
                      : 'bg-gray-600 border-gray-600'
                  }`}
                >
                  <div
                    className={`toggle-dot absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      settings.notifyViaWhatsApp ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
              </div>
            </label>

            {settings.notifyViaWhatsApp && (
              <div className="mt-2">
                <label className="block text-sm text-gray-400 mb-1">
                  Número do WhatsApp
                </label>
                <input
                  type="tel"
                  value={settings.whatsappNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappNumber: e.target.value })
                  }
                  placeholder="+55 11 99999-9999"
                  className="input-field"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={handleSave} className="btn-primary">
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

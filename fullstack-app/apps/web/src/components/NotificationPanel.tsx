import React from "react"
import { RoleNotification, Role } from "../types"

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  currentRole: Role
  notifications: RoleNotification[]
  onMarkAsRead: (id: string) => void
  onClearAll: () => void
  onSelectOrderNotification?: (orderId: string) => void
}

export default function NotificationPanel({
  isOpen,
  onClose,
  currentRole,
  notifications,
  onMarkAsRead,
  onClearAll,
  onSelectOrderNotification,
}: NotificationPanelProps) {
  if (!isOpen) return null

  // Filter notifications relevant to current active role
  const roleNotifications = notifications.filter(
    (n) => n.recipientRole === currentRole || n.recipientRole === "admin",
  )

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E4DAC8] rounded-3xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4DAC8] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">🔔</span>
          <h3 className="text-xs font-bold font-serif text-[#241C15]">
            Notifications ({currentRole.toUpperCase()})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {roleNotifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[10px] text-[#8C7E6D] hover:text-[#241C15] font-semibold cursor-pointer"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-[#8C7E6D] hover:text-[#241C15] font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto space-y-2 pr-1 text-xs">
        {roleNotifications.length === 0 ? (
          <div className="text-center py-8 text-[#8C7E6D] space-y-1">
            <span className="text-2xl block">🔕</span>
            <p className="font-bold">No new notifications</p>
            <p className="text-[11px]">
              Updates regarding your orders will appear here.
            </p>
          </div>
        ) : (
          roleNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                onMarkAsRead(notif.id)
                if (notif.orderId && onSelectOrderNotification) {
                  onSelectOrderNotification(notif.orderId)
                  onClose()
                }
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                !notif.read
                  ? "bg-[#FAF7F2] border-[#C9922E]/50 shadow-xs"
                  : "bg-white border-[#E4DAC8]/60 opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-[#241C15] text-xs leading-snug">
                  {notif.title}
                </h4>
                <span className="text-[10px] text-[#8C7E6D] shrink-0 font-mono">
                  {notif.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-[#6B6255] mt-1 leading-relaxed">
                {notif.message}
              </p>
              {notif.orderId && (
                <span className="inline-block mt-1.5 text-[10px] font-bold text-[#B7592F] bg-[#B7592F]/10 px-2 py-0.5 rounded-full">
                  Order #{notif.orderId} →
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

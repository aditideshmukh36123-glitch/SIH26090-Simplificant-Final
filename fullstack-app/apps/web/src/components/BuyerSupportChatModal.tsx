import React, { useState, useRef } from "react"
import { CustomerOrder, ChatMessage, LanguageCode } from "../types"
import { speechService } from "../utils/speechService"
import type { NativeVoicePayload } from "../utils/speechService"

interface BuyerSupportChatModalProps {
  isOpen: boolean
  onClose: () => void
  orders: CustomerOrder[]
  prefillOrderId?: string
  showToast: (msg: string) => void
  selectedLanguage?: LanguageCode
}

export default function BuyerSupportChatModal({
  isOpen,
  onClose,
  orders,
  prefillOrderId,
  showToast,
  selectedLanguage = "en",
}: BuyerSupportChatModalProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    prefillOrderId || orders[0]?.id || "",
  )
  const [inputMessage, setInputMessage] = useState("")
  const [isAgentTyping, setIsAgentTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const stopListeningRef = useRef<(() => void) | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-init-1",
      senderRole: "support",
      senderName: "Simplificant Sahayak Helpdesk",
      text: "Namaste! Welcome to Simplificant Buyer Care. How can we assist you with your orders, handcrafted artisan products, or doorstep OTP delivery today?",
      timestamp: "Just now",
    },
  ])

  const toggleMic = () => {
    if (isListening) {
      if (stopListeningRef.current) {
        stopListeningRef.current()
        stopListeningRef.current = null
      }
      setIsListening(false)
      showToast("Microphone stopped")
    } else {
      setIsListening(true)
      showToast("Listening... Speak your support query")
      const stopFn = speechService.startListening(
        selectedLanguage,
        (text, isFinal) => {
          setInputMessage(text)
          if (isFinal) {
            setIsListening(false)
          }
        },
        (err) => {
          console.warn("Support chat speech error:", err)
          setIsListening(false)
          showToast("Voice sample query filled")
          setInputMessage("What is the status of my order delivery and OTP?")
        },
        {
          onAudio: (payload: NativeVoicePayload) => {
            setIsListening(false)
            const fallback =
              "What is the status of my order delivery and OTP?"
            setMessages((prev) => [
              ...prev,
              {
                id: `msg-voice-${Date.now()}`,
                senderRole: "buyer",
                senderName: "You (Buyer)",
                text: fallback,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                orderId: selectedOrderId,
                voiceUrl: payload.dataUrl,
              },
            ])
            handleSendMessage(fallback)
            showToast("🎙️ Voice note recorded & sent.")
          },
          onCancel: () => {
            setIsListening(false)
            showToast("Voice recording cancelled.")
          },
        },
      )
      stopListeningRef.current = stopFn
    }
  }

  if (!isOpen) return null

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputMessage.trim()
    if (!textToSend) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: "buyer",
      senderName: "You (Buyer)",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      orderId: selectedOrderId,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputMessage("")
    setIsAgentTyping(true)

    setTimeout(() => {
      setIsAgentTyping(false)
      const lower = textToSend.toLowerCase()
      let replyText = ""

      if (
        lower.includes("otp") ||
        lower.includes("handover") ||
        lower.includes("code")
      ) {
        replyText = `Your delivery handover OTP for Order #${selectedOrderId || "OD-2026-8891"} is securely stored in your 'My Orders' tracking modal. Please give it to Delivery Agent Vikram Singh once he arrives at your doorstep.`
      } else if (
        lower.includes("where") ||
        lower.includes("track") ||
        lower.includes("status") ||
        lower.includes("delay")
      ) {
        replyText = `We checked Order #${selectedOrderId || "OD-2026-8891"}. The craft has passed GI guild quality inspection and is currently assigned to India Post Express. You can view the live milestone timeline in your Orders dashboard.`
      } else if (
        lower.includes("dbt") ||
        lower.includes("artisan") ||
        lower.includes("middleman") ||
        lower.includes("money")
      ) {
        replyText = `On Simplificant, 100% of your payment is settled directly into the master artisan's bank/UPI account under the MoSJE welfare initiative. Zero middleman cuts are deducted.`
      } else if (lower.includes("cancel") || lower.includes("refund")) {
        replyText = `Orders can be cancelled anytime before dispatch. If cancelled, a 100% full refund is instantly reversed back to your original payment method.`
      } else {
        replyText = `Thank you for reaching out! A dedicated MoSJE artisan support officer has received ticket #${Date.now().toString().slice(-4)} regarding Order #${selectedOrderId || "general query"} and will follow up shortly.`
      }

      const agentReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        senderRole: "support",
        senderName: "Simplificant Support Officer",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        orderId: selectedOrderId,
      }
      setMessages((prev) => [...prev, agentReply])
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-[#140F0B]/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E0D5C1] shadow-2xl overflow-hidden flex flex-col h-[560px]">
        {/* Header */}
        <div className="bg-[#241C15] text-[#F7F2E9] p-4 flex items-center justify-between border-b border-[#3A2C20]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C9922E] text-[#241C15] flex items-center justify-center font-bold text-sm">
              💬
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif text-[#F7F2E9]">
                Buyer Care & Support
              </h3>
              <p className="text-[10px] text-[#DCA33C]">
                MoSJE Virtual Helpdesk • Fast Resolution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Linked Order Dropdown */}
        {orders.length > 0 && (
          <div className="bg-[#FAF7F2] p-2.5 border-b border-[#E4DAC8] flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-[#8C7E6D] font-bold">
              Regarding Order:
            </span>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="p-1.5 rounded-xl border border-[#E4DAC8] bg-white text-xs font-bold text-[#241C15] outline-none"
            >
              <option value="">General Support Query</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.id} - {o.productTitle} ({o.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FDFBF7] text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderRole === "buyer" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl ${
                  msg.senderRole === "buyer"
                    ? "bg-[#241C15] text-[#F7F2E9] rounded-br-xs"
                    : "bg-[#FAF7F2] border border-[#E4DAC8] text-[#241C15] rounded-bl-xs shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 text-[10px] opacity-70">
                  <span className="font-bold">{msg.senderName}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
                {msg.voiceUrl && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#C9922E]">
                      🎙️ Voice note
                    </span>
                    <audio
                      controls
                      src={msg.voiceUrl}
                      preload="metadata"
                      className="h-9 w-full max-w-[200px]"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isAgentTyping && (
            <div className="flex justify-start">
              <div className="bg-[#FAF7F2] border border-[#E4DAC8] p-2.5 rounded-2xl rounded-bl-xs text-[11px] text-[#8C7E6D] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9922E] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9922E] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9922E] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1">Support officer typing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="p-2 bg-[#FAF7F2] border-t border-[#E4DAC8] overflow-x-auto scrollbar-none flex gap-1.5 text-[11px]">
          {[
            {
              label: "🔐 Where is my Delivery OTP?",
              q: "Where can I find my delivery handover OTP code?",
            },
            {
              label: "📍 Track My Package",
              q: "What is the live status and location of my package?",
            },
            {
              label: "🏛️ 100% Direct Artisan Model",
              q: "How do I know the artisan receives 100% of my money?",
            },
            {
              label: "❌ Cancellation & Refund",
              q: "How do cancellations and refunds work?",
            },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip.q)}
              className="bg-white border border-[#E4DAC8] hover:border-[#C9922E] text-[#241C15] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="p-3 bg-white border-t border-[#E4DAC8] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isListening
                ? "Listening... Speak now"
                : "Type question or tap mic to speak..."
            }
            className={`flex-1 rounded-full border px-4 py-2 text-xs text-[#241C15] outline-none transition-all ${
              isListening
                ? "border-red-400 bg-red-50/40 ring-1 ring-red-300"
                : "border-[#E4DAC8] bg-[#FAF7F2] focus:border-[#C9922E]"
            }`}
          />
          <button
            type="button"
            onClick={toggleMic}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 cursor-pointer shadow-xs transition-all ${
              isListening
                ? "bg-red-600 text-white animate-pulse ring-2 ring-red-400"
                : "bg-[#FAF7F2] hover:bg-[#EFE8D8] border border-[#E4DAC8] text-[#241C15]"
            }`}
            title={isListening ? "Stop listening" : "Speak question"}
          >
            🎙️
          </button>
          <button
            type="submit"
            className="bg-[#241C15] hover:bg-[#3A2C20] text-white px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

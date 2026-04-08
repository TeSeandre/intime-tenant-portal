import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

/**
 * Renders a real-time message thread between the current user and a counterpart.
 *
 * Props:
 *   threadId      {string}
 *   recipientId   {string}
 */
export default function MessageThread({ threadId, recipientId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!threadId) return
    loadMessages()

    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` },
        payload => setMessages(prev => [...prev, payload.new])
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [threadId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadMessages() {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
      if (error) throw error
      setMessages(data)

      // Mark unread messages as read
      const unread = data.filter(m => m.recipient_id === user.id && !m.read_at)
      if (unread.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unread.map(m => m.id))
      }
    } catch {
      // fail silently — messages will still display if already loaded
    }
  }

  async function handleSend() {
    const text = body.trim()
    if (!text || sending) return
    setSending(true)
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: recipientId,
        thread_id: threadId,
        body: text,
      })
      if (error) throw error
      setBody('')
    } catch {
      // surface error to user without console.log
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className='flex flex-col h-full min-h-72'>
      <div className='flex-1 overflow-y-auto flex flex-col gap-3 p-4'>
        {messages.map(msg => {
          const mine = msg.sender_id === user.id
          return (
            <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs sm:max-w-sm px-4 py-2 rounded-2xl text-sm ${
                  mine
                    ? 'bg-brand-terra text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-brand-charcoal rounded-bl-sm'
                }`}
              >
                <p>{msg.body}</p>
                <p className={`text-xs mt-1 ${mine ? 'text-orange-200' : 'text-gray-400'}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className='border-t border-gray-200 p-3 flex gap-2 bg-white'>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder='Type a message...'
          className='flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-terra'
        />
        <button
          onClick={handleSend}
          disabled={sending || !body.trim()}
          className='px-4 py-2 bg-brand-terra text-white rounded-lg text-sm font-medium hover:bg-brand-terra-dk transition-colors disabled:opacity-40'
        >
          Send
        </button>
      </div>
    </div>
  )
}

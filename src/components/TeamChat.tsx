'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Megaphone, Image as ImageIcon, FileText, X } from 'lucide-react';
import type { User, ChatMessage } from '@/lib/types';
import { getUserPhoto, getRoleBadgeClass, formatTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface TeamChatProps {
  currentUser: User;
  users: User[];
  messages: ChatMessage[];
  onSend: () => void;
}

export default function TeamChat({ currentUser, users, messages, onSend }: TeamChatProps) {
  const [text, setText] = useState('');
  const [announcement, setAnnouncement] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [enlarged, setEnlarged] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }

  function removeFile() {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSend() {
    if (!text.trim() && !file) return;
    const supabase = createClient();
    const msgData: Record<string, unknown> = {
      user_id: currentUser.id,
      text: text.trim(),
      time: formatTime(new Date()),
      type: announcement ? 'announcement' : 'message',
    };
    if (preview) {
      msgData.file_name = file?.name || '';
      msgData.file_type = file?.type || '';
      msgData.file_url = preview;
    }
    const { error } = await supabase.from('chat_messages').insert(msgData);
    if (!error) {
      setText('');
      removeFile();
      setAnnouncement(false);
      onSend();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const userMap = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Team Chat</h3>
        {(currentUser.role === 'CEO' || currentUser.role === 'CTO') && (
          <button
            onClick={() => setAnnouncement(!announcement)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              announcement ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Announcement
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const sender = userMap.get(msg.user_id);
          const name = sender?.name || 'Unknown';
          const role = sender?.role || 'Employee';
          const photo = sender ? getUserPhoto(sender.email) : '/images/logo.png';

          return (
            <div key={msg.id} className={`flex gap-3 ${msg.type === 'announcement' ? 'bg-amber-50 -mx-4 px-4 py-3 rounded-lg border border-amber-200' : ''}`}>
              <img src={photo} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-800">{name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${getRoleBadgeClass(role)}`}>
                    {role}
                  </span>
                  {msg.type === 'announcement' && (
                    <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
                {msg.text && <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.text}</p>}
                {msg.file_url && (
                  <div className="mt-2">
                    {msg.file_type?.startsWith('image/') ? (
                      <img
                        src={msg.file_url}
                        alt={msg.file_name || 'Attachment'}
                        className="max-w-xs max-h-48 rounded-lg cursor-pointer border border-gray-200 hover:opacity-90 transition"
                        onClick={() => setEnlarged(msg.file_url!)}
                      />
                    ) : (
                      <a
                        href={msg.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-blue-600 hover:bg-gray-200 transition"
                      >
                        <FileText className="w-4 h-4" />
                        {msg.file_name || 'Attachment'}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t p-3">
        {preview && (
          <div className="mb-2 relative inline-block">
            <img src={preview} alt="Preview" className="h-20 rounded-lg border border-gray-200" />
            <button
              onClick={removeFile}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        {file && !preview && (
          <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span className="truncate">{file.name}</span>
            <button onClick={removeFile} className="ml-auto text-red-500 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.csv" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 transition shrink-0"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() && !file}
            className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {enlarged && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setEnlarged(null)}>
          <img src={enlarged} alt="Enlarged" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore, useGiftStore } from '../src/store';
import type { GiftReceivedEvent } from 'shared-types';

interface GiftCatalogItem { _id: string; code: string; name: string; tokenCost: number; }

export default function Home() {
  const [messages, setMessages] = useState<{text:string; at:number}[]>([]);
  const [input, setInput] = useState('');
  const giftsStore = useGiftStore();
  const [token, setToken] = useState<string | null>(null);
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [giftCatalog, setGiftCatalog] = useState<GiftCatalogItem[]>([]);
  const [selectedGift, setSelectedGift] = useState('');
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);
  const [giftSocket, setGiftSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!chatSocket || !giftSocket) {
      const stored = localStorage.getItem('jwt');
      if (stored) setToken(stored);
      const chat = io(wsUrl + '/chat', { auth: stored ? { token: stored } : undefined });
      chat.on('welcome', (d) => console.log(d));
      chat.on('chat:message', (msg) => setMessages(m=>[...m, msg]));
      setChatSocket(chat);
      const giftsNs = io(wsUrl + '/gifts', { auth: stored ? { token: stored } : undefined });
      giftsNs.on('welcome', (d)=> console.log(d));
      giftsNs.on('gift:received', (gift: GiftReceivedEvent)=> giftsStore.addGift(gift));
      setGiftSocket(giftsNs);
      return () => { chat.disconnect(); giftsNs.disconnect(); };
    }
  }, [wsUrl, chatSocket, giftSocket, giftsStore]);

  const authFetch = (url:string, body:object) => fetch(url, { method:'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) });

  const register = async () => {
    const res = await authFetch('http://localhost:4000/api/auth/register', { handle, password });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('jwt', data.token);
      loadGifts();
    }
  };
  const login = async () => {
    const res = await authFetch('http://localhost:4000/api/auth/login', { handle, password });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('jwt', data.token);
      loadGifts();
    }
  };

  const loadGifts = async () => {
    const res = await fetch('http://localhost:4000/api/gifts');
    const data = await res.json();
    setGiftCatalog(data);
  };

  const sendMessage = () => {
  if (!input || !chatSocket) return;
  chatSocket.emit('chat:message', { text: input, at: Date.now() });
    setInput('');
  };
  const sendGift = () => {
  if (!selectedGift || !giftSocket) return;
  giftSocket.emit('gift:send', { code: selectedGift });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="border border-neutral-800 rounded p-4 h-80 overflow-y-auto bg-neutral-900/50">
          {messages.map((m,i)=> <div key={i} className="text-sm text-neutral-200">{m.text}</div>)}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 bg-neutral-800 rounded px-3 py-2 text-sm" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=> e.key==='Enter' && sendMessage()} placeholder="Type message" />
          <button onClick={sendMessage} className="bg-brand px-4 py-2 rounded text-sm font-medium">Send</button>
        </div>
      </div>
      <div className="space-y-4">
        {!token && (
          <div className="border border-neutral-800 rounded p-4 space-y-2">
            <h3 className="font-semibold">Auth</h3>
            <input className="w-full bg-neutral-800 rounded px-3 py-2 text-sm" value={handle} onChange={e=>setHandle(e.target.value)} placeholder="Handle" />
            <input type="password" className="w-full bg-neutral-800 rounded px-3 py-2 text-sm" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
            <div className="flex gap-2">
              <button onClick={register} className="flex-1 bg-brand py-2 rounded text-sm font-medium">Register</button>
              <button onClick={login} className="flex-1 bg-neutral-700 py-2 rounded text-sm font-medium">Login</button>
            </div>
          </div>
        )}
        <div className="border border-neutral-800 rounded p-4">
          <h3 className="font-semibold mb-2">Send Gift</h3>
            <select className="w-full bg-neutral-800 rounded px-2 py-2 text-sm mb-2" value={selectedGift} onChange={e=>setSelectedGift(e.target.value)}>
              <option value="">Select gift</option>
              {giftCatalog.map(g=> <option key={g._id} value={g.code}>{g.name} ({g.tokenCost})</option>)}
            </select>
            <button onClick={sendGift} disabled={!token || !selectedGift} className="w-full bg-brand/80 disabled:opacity-40 py-2 rounded text-sm font-medium">Send</button>
        </div>
        <div className="border border-neutral-800 rounded p-4 h-60 overflow-y-auto">
          <h3 className="font-semibold mb-2">Gifts Feed</h3>
          <ul className="space-y-1 text-sm">
            {giftsStore.gifts.map((g,i)=> <li key={i} className="text-brand">{g.from} sent {g.code}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

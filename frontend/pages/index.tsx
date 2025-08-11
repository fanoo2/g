import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore, useGiftStore } from '../src/store';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
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
        <Card className="h-80 overflow-y-auto bg-neutral-900/40">
          {messages.map((m,i)=> <div key={i} className="text-sm text-neutral-200">{m.text}</div>)}
        </Card>
        <div className="flex gap-2">
          <input className="flex-1 bg-neutral-800 rounded px-3 py-2 text-sm" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=> e.key==='Enter' && sendMessage()} placeholder="Type message" />
          <Button onClick={sendMessage} variant="primary" size="md">Send</Button>
        </div>
      </div>
      <div className="space-y-4">
        {!token && (
          <Card className="space-y-2">
            <h3 className="font-semibold">Auth</h3>
            <input className="w-full bg-neutral-800 rounded px-3 py-2 text-sm" value={handle} onChange={e=>setHandle(e.target.value)} placeholder="Handle" />
            <input type="password" className="w-full bg-neutral-800 rounded px-3 py-2 text-sm" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
            <div className="flex gap-2">
              <Button onClick={register} className="flex-1" variant="primary">Register</Button>
              <Button onClick={login} className="flex-1" variant="subtle">Login</Button>
            </div>
          </Card>
        )}
        <Card>
          <h3 className="font-semibold mb-2">Send Gift</h3>
            <select className="w-full bg-neutral-800 rounded px-2 py-2 text-sm mb-2" value={selectedGift} onChange={e=>setSelectedGift(e.target.value)}>
              <option value="">Select gift</option>
              {giftCatalog.map(g=> <option key={g._id} value={g.code}>{g.name} ({g.tokenCost})</option>)}
            </select>
            <Button onClick={sendGift} disabled={!token || !selectedGift} className="w-full disabled:opacity-40" variant="primary">Send</Button>
        </Card>
        <Card className="h-60 overflow-y-auto">
          <h3 className="font-semibold mb-2">Gifts Feed</h3>
          <ul className="space-y-1 text-sm">
            {giftsStore.gifts.map((g,i)=> <li key={i} className="text-brand flex items-center gap-2">{g.from} sent <Badge variant="level">{g.code}</Badge></li>)}
          </ul>
        </Card>
      </div>
    </div>
  );
}

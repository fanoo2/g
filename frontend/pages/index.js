import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [gifts, setGifts] = useState([]);
  const [token, setToken] = useState(null);
  const [handle, setHandle] = useState('');
  const [giftCatalog, setGiftCatalog] = useState([]);
  const [selectedGift, setSelectedGift] = useState('');
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!socket) {
      const s = io(wsUrl, { auth: token ? { token } : undefined });
      s.on('welcome', (data) => console.log(data));
      s.on('chat:message', (msg) => setMessages((m) => [...m, msg]));
      s.on('gift:received', (gift) => setGifts((g) => [...g, gift]));
      setSocket(s);
      return () => { s.disconnect(); };
    }
  }, [wsUrl, token, socket]);

  const register = async () => {
    const res = await fetch('http://localhost:4000/api/auth/register', { method:'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ handle }) });
    const data = await res.json();
    setToken(data.token);
    localStorage.setItem('jwt', data.token);
    loadGifts();
  };

  const loadGifts = async () => {
    const res = await fetch('http://localhost:4000/api/gifts');
    const data = await res.json();
    setGiftCatalog(data);
  };

  const sendMessage = () => {
    if (!input || !socket) return;
    socket.emit('chat:message', { text: input, at: Date.now() });
    setInput('');
  };
  const sendGift = () => {
    if (!selectedGift || !socket) return;
    socket.emit('gift:send', { code: selectedGift });
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
            <h3 className="font-semibold">Quick Register</h3>
            <input className="w-full bg-neutral-800 rounded px-3 py-2 text-sm" value={handle} onChange={e=>setHandle(e.target.value)} placeholder="Handle" />
            <button onClick={register} className="w-full bg-brand py-2 rounded text-sm font-medium">Register</button>
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
            {gifts.map((g,i)=> <li key={i} className="text-brand">{g.from} sent {g.code}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

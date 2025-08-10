import { create } from 'zustand';
import type { GiftReceivedEvent } from 'shared-types';

interface AuthState { token: string | null; handle: string | null; setAuth: (t:string,h:string)=>void; logout: ()=>void; }
interface GiftState { gifts: GiftReceivedEvent[]; addGift: (g:GiftReceivedEvent)=>void; }

export const useAuthStore = create<AuthState>((set)=>({
  token: null,
  handle: null,
  setAuth: (token, handle) => set({ token, handle }),
  logout: () => set({ token: null, handle: null })
}));

export const useGiftStore = create<GiftState>((set)=>({
  gifts: [],
  addGift: (g) => set(s=> ({ gifts: [...s.gifts, g] }))
}));

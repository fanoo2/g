export interface JwtUser { id: string; handle: string; }
export interface GiftSocketPayload { code: string; }
export interface GiftReceivedEvent { code: string; from: string; tokens: number; commandAction?: string; }

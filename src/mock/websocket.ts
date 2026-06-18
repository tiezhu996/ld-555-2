import type { LiveScore, NotificationItem } from '../types/chat';
import type { OnlineStatus } from '../types/player';

type WebSocketEvent =
  | { type: 'online:update'; payload: { playerId: string; status: OnlineStatus } }
  | { type: 'score:update'; payload: LiveScore }
  | { type: 'notification'; payload: NotificationItem };

type Listener = (event: WebSocketEvent) => void;

const playerIds = ['p-01', 'p-02', 'p-03', 'p-04', 'p-05', 'p-06', 'p-07', 'p-08', 'p-09', 'p-10'];
const statuses: OnlineStatus[] = ['online', 'offline', 'in-game'];
const liveMatchIds = ['m-01', 'm-02', 'm-03'];

export class MockWebSocket {
  private listeners = new Set<Listener>();
  private timers: number[] = [];
  private matchScores: Record<string, { scoreA: number; scoreB: number }> = {
    'm-01': { scoreA: 16, scoreB: 11 },
    'm-02': { scoreA: 0, scoreB: 0 },
    'm-03': { scoreA: 2, scoreB: 1 },
  };

  connect(listener: Listener): () => void {
    this.listeners.add(listener);
    if (this.timers.length === 0) this.start();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.stop();
    };
  }

  pushTournamentCreated(name: string): void {
    this.emit({
      type: 'notification',
      payload: {
        id: crypto.randomUUID(),
        type: 'tournament',
        message: `新赛事「${name}」已创建`,
        createdAt: new Date().toISOString(),
      },
    });
  }

  private start(): void {
    this.timers.push(window.setInterval(() => this.emitOnlineUpdate(), 15000));
    this.timers.push(window.setInterval(() => this.emitScoreUpdate(), 10000));
    this.timers.push(window.setInterval(() => this.emitInvitation(), 60000));
    window.setTimeout(() => this.emitInvitation(), 3000);
  }

  private stop(): void {
    this.timers.forEach((timer) => window.clearInterval(timer));
    this.timers = [];
  }

  private emitOnlineUpdate(): void {
    const playerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    this.emit({ type: 'online:update', payload: { playerId, status } });
  }

  private emitScoreUpdate(): void {
    const matchId = liveMatchIds[Math.floor(Math.random() * liveMatchIds.length)];
    const current = this.matchScores[matchId];
    const deltaA = Math.random() > 0.5 ? 1 : 0;
    const deltaB = deltaA === 0 && Math.random() > 0.5 ? 1 : 0;
    current.scoreA = Math.min(current.scoreA + deltaA, 30);
    current.scoreB = Math.min(current.scoreB + deltaB, 30);
    this.emit({
      type: 'score:update',
      payload: { matchId, scoreA: current.scoreA, scoreB: current.scoreB },
    });
  }

  private emitInvitation(): void {
    this.emit({
      type: 'notification',
      payload: {
        id: crypto.randomUUID(),
        type: 'team',
        message: 'Redline Protocol 向你发送了试训邀请',
        createdAt: new Date().toISOString(),
      },
    });
  }

  private emit(event: WebSocketEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}

export const mockWebSocket = new MockWebSocket();
export type { WebSocketEvent };

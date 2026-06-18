import { useEffect } from 'react';
import { mockWebSocket } from '../mock/websocket';
import { useChatStore } from '../stores/chatStore';
import { useMatchStore } from '../stores/matchStore';
import { usePlayerStore } from '../stores/playerStore';
import { useTournamentStore } from '../stores/tournamentStore';

export function useWebSocket() {
  const setPlayerPresence = useChatStore((state) => state.setPlayerPresence);
  const updateLiveScore = useChatStore((state) => state.updateLiveScore);
  const pushNotification = useChatStore((state) => state.pushNotification);
  const setOnlineStatus = usePlayerStore((state) => state.setOnlineStatus);
  const updateMatchScore = useMatchStore((state) => state.updateMatchScore);
  const updateBracketScore = useTournamentStore((state) => state.updateBracketScore);

  useEffect(() => {
    return mockWebSocket.connect((event) => {
      if (event.type === 'online:update') {
        setOnlineStatus(event.payload.playerId, event.payload.status);
        setPlayerPresence(event.payload.playerId, event.payload.status !== 'offline');
      }
      if (event.type === 'score:update') {
        updateLiveScore(event.payload);
        updateMatchScore(event.payload.matchId, event.payload.scoreA, event.payload.scoreB);
        updateBracketScore(event.payload.matchId, event.payload.scoreA, event.payload.scoreB);
      }
      if (event.type === 'notification') pushNotification(event.payload);
    });
  }, [pushNotification, setOnlineStatus, setPlayerPresence, updateLiveScore, updateMatchScore, updateBracketScore]);
}

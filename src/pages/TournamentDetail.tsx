import { useParams } from 'react-router-dom';
import { BracketChart } from '../components/common/BracketChart';
import { EmptyState } from '../components/common/EmptyState';
import { GameTag } from '../components/common/GameTag';
import { TeamCard } from '../components/common/TeamCard';
import { TournamentStatus } from '../constants/enums';
import { useTeam } from '../hooks/useTeam';
import { useTournament } from '../hooks/useTournament';
import { useChatStore } from '../stores/chatStore';
import { useMatchStore } from '../stores/matchStore';
import { usePlayerStore } from '../stores/playerStore';
import { tournamentFormatLabels, tournamentStatusLabels } from '../utils/format';

export function TournamentDetail() {
  const { id } = useParams();
  const { tournaments, registerTeam } = useTournament();
  const { teams } = useTeam();
  const players = usePlayerStore((state) => state.players);
  const matches = useMatchStore((state) => state.matches);
  const liveScores = useChatStore((state) => state.liveScores);
  const tournament = tournaments.find((item) => item.id === id);
  if (!tournament) return <div className="page"><EmptyState title="赛事不存在" detail="请返回赛事大厅重新选择。" /></div>;
  const joinedTeams = teams.filter((team) => tournament.teams.includes(team.id));
  const tournamentMatches = matches.filter((match) => match.tournamentId === tournament.id);

  const getDisplayScore = (match: { id: string; score: { a: number; b: number } }) => {
    const live = liveScores[match.id];
    return live ? { a: live.scoreA, b: live.scoreB } : match.score;
  };

  const getOnlineCount = (teamMembers: string[]) => {
    return players.filter((p) => teamMembers.includes(p.id) && p.onlineStatus !== 'offline').length;
  };

  return (
    <div className="page detail-page">
      <section className="detail-hero">
        <div className="detail-hero__tags">
          <GameTag game={tournament.game} />
          {tournament.status === TournamentStatus.IN_PROGRESS && <span className="live-badge">● 直播中</span>}
        </div>
        <h1>{tournament.name}</h1>
        <p>{tournamentFormatLabels[tournament.format]} · {tournament.prize} · {tournamentStatusLabels[tournament.status]}</p>
        {tournament.status === TournamentStatus.REGISTRATION && <button className="button button--primary" onClick={() => void registerTeam(tournament.id, teams[0]?.id || '')}>报名 North Byte</button>}
      </section>
      <BracketChart format={tournament.format} rounds={tournament.bracket.rounds} liveScores={liveScores} />
      <section className="section-head"><h2>参赛队伍</h2></section>
      <div className="card-grid">
        {joinedTeams.map((team) => (
          <div key={team.id} className="team-card-wrapper">
            <TeamCard team={team} captain={players.find((player) => player.id === team.captainId)} compact />
            <div className="team-online-info">
              <i className={`status-dot status-dot--${getOnlineCount(team.members) > 0 ? 'online' : 'offline'}`} />
              <span>{getOnlineCount(team.members)}/{team.members.length} 人在线</span>
            </div>
          </div>
        ))}
      </div>
      <section className="timeline">
        <h2>对局结果</h2>
        {tournamentMatches.map((match) => {
          const score = getDisplayScore(match);
          const hasLiveUpdate = !!liveScores[match.id];
          return (
            <div className={`timeline-item ${hasLiveUpdate ? 'timeline-item--live' : ''}`} key={match.id}>
              <span>{match.teamA} vs {match.teamB}</span>
              <strong className={hasLiveUpdate ? 'score-live' : ''}>
                {score.a} : {score.b}
                {hasLiveUpdate && <span className="live-dot" />}
              </strong>
            </div>
          );
        })}
      </section>
    </div>
  );
}

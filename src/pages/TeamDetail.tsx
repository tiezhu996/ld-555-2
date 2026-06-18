import { useParams } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { GameTag } from '../components/common/GameTag';
import { PlayerBadge } from '../components/common/PlayerBadge';
import { TournamentStatus } from '../constants/enums';
import { usePlayer } from '../hooks/usePlayer';
import { useTeam } from '../hooks/useTeam';
import { useChatStore } from '../stores/chatStore';
import { useMatchStore } from '../stores/matchStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { winRate } from '../utils/format';

export function TeamDetail() {
  const { id } = useParams();
  const { teams, updateTeam } = useTeam();
  const { players } = usePlayer();
  const matches = useMatchStore((state) => state.matches);
  const tournaments = useTournamentStore((state) => state.tournaments);
  const liveScores = useChatStore((state) => state.liveScores);
  const team = teams.find((item) => item.id === id);
  if (!team) return <div className="page"><EmptyState title="战队不存在" detail="请返回战队广场重新选择。" /></div>;
  const members = players.filter((player) => team.members.includes(player.id));
  const history = tournaments.filter((item) => item.teams.includes(team.id));
  const teamMatches = matches.filter((match) => match.teamA === team.id || match.teamB === team.id);

  const getDisplayScore = (match: { id: string; score: { a: number; b: number } }) => {
    const live = liveScores[match.id];
    return live ? { a: live.scoreA, b: live.scoreB } : match.score;
  };

  const getOnlineCount = () => {
    return members.filter((p) => p.onlineStatus !== 'offline').length;
  };

  const getInGameCount = () => {
    return members.filter((p) => p.onlineStatus === 'in-game').length;
  };

  return (
    <div className="page detail-page">
      <section className="team-hero">
        <div className="team-card__mark">{team.logo}</div>
        <div>
          <div className="team-hero__tags">
            <GameTag game={team.game} />
            <span className="online-summary">
              <i className="status-dot status-dot--online" /> {getOnlineCount()}/{members.length} 在线
              {getInGameCount() > 0 && (
                <> · <i className="status-dot status-dot--in-game" /> {getInGameCount()} 游戏中</>
              )}
            </span>
          </div>
          <h1>{team.name}</h1>
          <p>{team.bio}</p>
          <strong>{team.wins}W / {team.losses}L · 胜率 {winRate(team.wins, team.losses)}%</strong>
        </div>
        <button className="button button--primary" onClick={() => void updateTeam({ ...team, members: Array.from(new Set([...team.members, 'p-01'])) })}>加入战队</button>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>队员列表</h2>
          <span className="panel-subtitle">
            <i className="status-dot status-dot--online" /> 在线 <i className="status-dot status-dot--in-game" /> 游戏中 <i className="status-dot status-dot--offline" /> 离线
          </span>
        </div>
        <div className="player-list">{members.map((player) => <PlayerBadge key={player.id} player={player} />)}</div>
      </section>
      <section className="timeline">
        <h2>赛事参与历史</h2>
        {history.map((item) => (
          <div className="timeline-item" key={item.id}>
            <span>{item.name}</span>
            <span className={item.status === TournamentStatus.IN_PROGRESS ? 'status-live' : ''}>
              {item.status === TournamentStatus.IN_PROGRESS && '● '}
              {item.status}
            </span>
          </div>
        ))}
      </section>
      <section className="timeline">
        <h2>对局记录</h2>
        {teamMatches.map((match) => {
          const score = getDisplayScore(match);
          const hasLiveUpdate = !!liveScores[match.id];
          return (
            <div className={`timeline-item ${hasLiveUpdate ? 'timeline-item--live' : ''}`} key={match.id}>
              <span>{match.teamA} vs {match.teamB}</span>
              <strong className={hasLiveUpdate ? 'score-live' : ''}>
                {score.a}:{score.b}
                {hasLiveUpdate && <span className="live-dot" />}
              </strong>
            </div>
          );
        })}
      </section>
    </div>
  );
}

import { motion } from 'framer-motion';
import type { TournamentFormat } from '../../constants/enums';
import type { LiveScore } from '../../types/chat';
import type { BracketRound } from '../../types/tournament';
import { tournamentFormatLabels } from '../../utils/format';

interface BracketChartProps {
  format: TournamentFormat;
  rounds: BracketRound[];
  compact?: boolean;
  liveScores?: Record<string, LiveScore>;
}

export function BracketChart({ format, rounds, compact = false, liveScores }: BracketChartProps) {
  const getDisplayScore = (match: { id: string; scoreA: number; scoreB: number }) => {
    const live = liveScores?.[match.id];
    return live ? { a: live.scoreA, b: live.scoreB } : { a: match.scoreA, b: match.scoreB };
  };

  return (
    <div className={`bracket bracket--${compact ? 'compact' : 'full'}`}>
      <div className="bracket__label">{tournamentFormatLabels[format]}</div>
      <div className="bracket__rounds">
        {rounds.map((round) => (
          <section className="bracket__round" key={round.name}>
            <h4>{round.name}</h4>
            {round.matches.map((match) => {
              const score = getDisplayScore(match);
              const hasLiveUpdate = !!liveScores?.[match.id];
              return (
                <div className={`bracket__match ${hasLiveUpdate ? 'bracket__match--live' : ''}`} key={match.id}>
                  <span>{match.teamA}</span>
                  <motion.strong
                    key={`${score.a}-${score.b}`}
                    initial={{ scale: 1.2, color: 'var(--accent)' }}
                    animate={{ scale: 1, color: 'currentColor' }}
                    transition={{ duration: 0.5 }}
                  >
                    {score.a} : {score.b}
                    {hasLiveUpdate && <span className="live-dot" />}
                  </motion.strong>
                  <span>{match.teamB}</span>
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}

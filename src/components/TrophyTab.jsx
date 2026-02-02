import { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { TEAMS } from '../data/teams';
import './TrophyTab.css';

const TrophyTab = () => {
  const { matches, predictions, calculateTopScorers } = useApp();

  const topScorers = useMemo(() => calculateTopScorers(), [calculateTopScorers]);

  // Get the final match
  const finalMatch = matches.find(m => m.isFinal && m.status === 'ft');

  // Calculate top assists
  const topAssists = useMemo(() => {
    const assists = {};
    matches
      .filter(m => m.status === 'ft')
      .forEach(match => {
        (match.goals || []).forEach(goal => {
          if (goal.assist) {
            const key = goal.assist;
            if (!assists[key]) {
              assists[key] = { player: goal.assist, assists: 0 };
            }
            assists[key].assists++;
          }
        });
      });
    return Object.values(assists)
      .sort((a, b) => b.assists - a.assists);
  }, [matches]);

  // Tournament stats
  const tournamentStats = useMemo(() => {
    const ftMatches = matches.filter(m => m.status === 'ft');
    const totalGoals = ftMatches.reduce((sum, m) => sum + (m.scoreHome || 0) + (m.scoreAway || 0), 0);
    const totalMatches = ftMatches.length;

    // Count MoM awards per player
    const momCounts = {};
    ftMatches.forEach(m => {
      if (m.manOfTheMatch) {
        momCounts[m.manOfTheMatch] = (momCounts[m.manOfTheMatch] || 0) + 1;
      }
    });

    // Hat-tricks
    const hatTricks = [];
    ftMatches.forEach(m => {
      const scorerCount = {};
      (m.goals || []).forEach(g => {
        if (g.player && g.player !== 'Own Goal') {
          scorerCount[g.player] = (scorerCount[g.player] || 0) + 1;
        }
      });
      Object.entries(scorerCount).forEach(([player, goals]) => {
        if (goals >= 3) {
          hatTricks.push({ player, goals, matchNum: m.matchNumber });
        }
      });
    });

    return {
      totalGoals,
      totalMatches,
      avgGoals: totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : 0,
      momCounts,
      hatTricks
    };
  }, [matches]);

  // Fan Favourites - overall player votes
  const fanFavourites = useMemo(() => {
    const playerVotes = {};
    predictions.forEach(p => {
      if (p.predictedPlayer) {
        if (!playerVotes[p.predictedPlayer]) {
          playerVotes[p.predictedPlayer] = {
            player: p.predictedPlayer,
            votes: 0,
            team: p.predictedTeam
          };
        }
        playerVotes[p.predictedPlayer].votes++;
      }
    });
    return Object.values(playerVotes)
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10);
  }, [predictions]);

  // Poll Leaderboard - users who won coins
  const pollLeaderboard = useMemo(() => {
    const userCoins = {};
    const ftMatches = matches.filter(m => m.status === 'ft' && m.momWinners && m.momWinners.length > 0);

    ftMatches.forEach(match => {
      (match.momWinners || []).forEach(email => {
        const name = email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase());
        if (!userCoins[email]) {
          userCoins[email] = { email, name, coins: 0, wins: 0 };
        }
        userCoins[email].coins += 100;
        userCoins[email].wins += 1;
      });
    });

    return Object.values(userCoins)
      .sort((a, b) => b.coins - a.coins)
      .slice(0, 10);
  }, [matches]);

  // Awards data
  const awards = {
    champion: {
      team: 'dhurandhars',
      title: 'CHAMPIONS',
      subtitle: 'Scapia Offside 2026'
    },
    runnerUp: {
      team: 'userflow',
      title: 'RUNNERS UP'
    },
    goldenBoot: {
      player: 'Avaneesh Kulkarni',
      team: 'userflow',
      goals: topScorers.find(s => s.player === 'Avaneesh Kulkarni')?.goals || 8,
      title: 'GOLDEN BOOT',
      icon: '👟'
    },
    goldenGlove: {
      player: 'Sandipan',
      team: 'feel-united',
      title: 'GOLDEN GLOVE',
      icon: '🧤'
    },
    manOfSeries: [
      { player: 'Ninad', team: 'feel-united' },
      { player: 'Sumedh Zope', team: 'userflow' }
    ]
  };

  const champion = TEAMS[awards.champion.team];
  const runnerUp = TEAMS[awards.runnerUp.team];

  return (
    <div className="trophy-tab">
      {/* Confetti Effect */}
      <div className="confetti-container">
        {[...Array(50)].map((_, i) => (
          <div key={i} className={`confetti confetti-${i % 5}`} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }} />
        ))}
      </div>

      {/* Champion Banner */}
      <section className="champion-section animate-slide-up">
        <div className="champion-badge">SCAPIA OFFSIDE 2026</div>
        <div className="trophy-icon">🏆</div>
        <h1 className="champion-title">CHAMPIONS</h1>
        <div className="champion-team">
          <img src={champion?.logo} alt={champion?.name} className="champion-logo" />
          <h2 className="champion-name">{champion?.name}</h2>
        </div>
        <div className="champion-glow"></div>
      </section>

      {/* Final Result */}
      {finalMatch && (
        <section className="final-result-section animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="section-header">
            <h2 className="section-title">THE FINAL</h2>
            <span className="section-badge final-badge">MATCHDAY 3</span>
          </div>

          <div className="final-card">
            <div className="final-teams">
              <div className="final-team home">
                <img src={TEAMS[finalMatch.home]?.logo} alt="" className="final-team-logo" />
                <span className="final-team-name">{TEAMS[finalMatch.home]?.shortName}</span>
              </div>

              <div className="final-score-container">
                <div className="final-score">
                  <span className="score-num">{finalMatch.scoreHome}</span>
                  <span className="score-divider">-</span>
                  <span className="score-num">{finalMatch.scoreAway}</span>
                </div>
                <div className="penalty-result">
                  <span className="penalty-badge">PENALTIES</span>
                  <span className="penalty-score">5 - 3</span>
                </div>
              </div>

              <div className="final-team away">
                <img src={TEAMS[finalMatch.away]?.logo} alt="" className="final-team-logo" />
                <span className="final-team-name">{TEAMS[finalMatch.away]?.shortName}</span>
              </div>
            </div>

            <div className="final-scorers">
              {(finalMatch.goals || []).map((goal, idx) => (
                <div key={idx} className={`final-goal ${goal.team === finalMatch.home ? 'home' : 'away'}`}>
                  <span className="goal-icon">⚽</span>
                  <span className="goal-player">{goal.player}</span>
                  {goal.assist && <span className="goal-assist">({goal.assist})</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Individual Awards */}
      <section className="awards-section animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <h2 className="section-title">TOURNAMENT AWARDS</h2>
          <span className="section-badge awards-badge">🏅</span>
        </div>

        <div className="awards-grid">
          {/* Golden Boot */}
          <div className="award-card golden-boot">
            <div className="award-icon">{awards.goldenBoot.icon}</div>
            <div className="award-title">{awards.goldenBoot.title}</div>
            <div className="award-player">
              <img src={TEAMS[awards.goldenBoot.team]?.logo} alt="" className="award-team-logo" />
              <span className="award-player-name">{awards.goldenBoot.player}</span>
            </div>
            <div className="award-stat">{awards.goldenBoot.goals} GOALS</div>
          </div>

          {/* Golden Glove */}
          <div className="award-card golden-glove">
            <div className="award-icon">{awards.goldenGlove.icon}</div>
            <div className="award-title">{awards.goldenGlove.title}</div>
            <div className="award-player">
              <img src={TEAMS[awards.goldenGlove.team]?.logo} alt="" className="award-team-logo" />
              <span className="award-player-name">{awards.goldenGlove.player}</span>
            </div>
            <div className="award-stat">BEST GOALKEEPER</div>
          </div>

          {/* Man of the Series */}
          <div className="award-card man-of-series">
            <div className="award-icon">⭐</div>
            <div className="award-title">MAN OF THE SERIES</div>
            <div className="award-players-dual">
              {awards.manOfSeries.map((p, idx) => (
                <div key={idx} className="award-player-mini">
                  <img src={TEAMS[p.team]?.logo} alt="" className="award-team-logo-mini" />
                  <span>{p.player}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Journey */}
      <section className="journey-section animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="section-header">
          <h2 className="section-title">TOURNAMENT JOURNEY</h2>
        </div>

        <div className="journey-timeline">
          <div className="journey-day">
            <div className="journey-day-header">
              <span className="journey-day-badge">DAY 1</span>
              <span className="journey-day-date">Jan 29, 2026</span>
            </div>
            <div className="journey-highlights">
              <div className="journey-item">Shashank's brace leads Dhurandhars to opening win</div>
              <div className="journey-item">Userflow dominates with 4-0 victory</div>
              <div className="journey-item">Dhurandhars edge past Userflow 2-1</div>
              <div className="journey-item">Parth Jhawar scores in 1-1 draw</div>
            </div>
          </div>

          <div className="journey-day">
            <div className="journey-day-header">
              <span className="journey-day-badge">DAY 2</span>
              <span className="journey-day-date">Jan 30, 2026</span>
            </div>
            <div className="journey-highlights">
              <div className="journey-item">Ninad shines with brace in 2-2 thriller</div>
              <div className="journey-item">Goaldiggers beat Feel United 2-0</div>
              <div className="journey-item highlight">Avaneesh scores 5 goals in 6-1 rout!</div>
              <div className="journey-item">Userflow come from behind to win 4-3</div>
              <div className="journey-item">Umair hat-trick seals 4-0 win</div>
            </div>
          </div>

          <div className="journey-day">
            <div className="journey-day-header">
              <span className="journey-day-badge">FINAL DAY</span>
              <span className="journey-day-date">Feb 2, 2026</span>
            </div>
            <div className="journey-highlights">
              <div className="journey-item">Feel United & Goaldiggers draw 1-1</div>
              <div className="journey-item">Dhurandhars crush Goaldiggers 3-0</div>
              <div className="journey-item">Feel United rout Userflow 4-0</div>
              <div className="journey-item highlight">Dhurandhars win on penalties in epic final!</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Summary */}
      <section className="final-stats-section animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="section-header">
          <h2 className="section-title">BY THE NUMBERS</h2>
        </div>

        <div className="final-stats-grid">
          <div className="final-stat-card">
            <span className="final-stat-value">{tournamentStats.totalGoals}</span>
            <span className="final-stat-label">Total Goals</span>
          </div>
          <div className="final-stat-card">
            <span className="final-stat-value">{tournamentStats.totalMatches}</span>
            <span className="final-stat-label">Matches</span>
          </div>
          <div className="final-stat-card">
            <span className="final-stat-value">{tournamentStats.avgGoals}</span>
            <span className="final-stat-label">Goals/Match</span>
          </div>
          <div className="final-stat-card">
            <span className="final-stat-value">{tournamentStats.hatTricks.length}</span>
            <span className="final-stat-label">Hat-tricks</span>
          </div>
        </div>
      </section>

      {/* Top Scorers Final */}
      <section className="top-scorers-final animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="section-header">
          <h2 className="section-title">TOP SCORERS</h2>
        </div>

        <div className="scorers-podium">
          {topScorers.slice(0, 5).map((scorer, idx) => (
            <div key={`${scorer.player}-${scorer.team}`} className={`podium-item rank-${idx + 1}`}>
              <span className="podium-rank">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
              </span>
              <img src={TEAMS[scorer.team]?.logo} alt="" className="podium-logo" />
              <span className="podium-name">{scorer.player}</span>
              <span className="podium-goals">{scorer.goals}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top Assists Final */}
      <section className="top-assists-final animate-slide-up" style={{ animationDelay: '0.55s' }}>
        <div className="section-header">
          <h2 className="section-title">TOP ASSISTS</h2>
        </div>

        <div className="scorers-podium assists-podium">
          {topAssists.slice(0, 5).map((player, idx) => (
            <div key={player.player} className={`podium-item rank-${idx + 1}`}>
              <span className="podium-rank">
                {idx === 0 ? '🎯' : idx + 1}
              </span>
              <span className="podium-name">{player.player}</span>
              <span className="podium-goals assist-num">{player.assists}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Hat-tricks */}
      {tournamentStats.hatTricks.length > 0 && (
        <section className="hattricks-section animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="section-header">
            <h2 className="section-title">HAT-TRICK HEROES</h2>
            <span className="section-badge">🎩</span>
          </div>

          <div className="hattricks-list">
            {tournamentStats.hatTricks.map((ht, idx) => (
              <div key={idx} className="hattrick-card">
                <span className="hattrick-icon">🎩</span>
                <div className="hattrick-info">
                  <span className="hattrick-player">{ht.player}</span>
                  <span className="hattrick-detail">{ht.goals} goals in Match {ht.matchNum}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fan Favourites */}
      {fanFavourites.length > 0 && (
        <section className="fan-favourites-section animate-slide-up" style={{ animationDelay: '0.65s' }}>
          <div className="section-header">
            <h2 className="section-title">FAN FAVOURITES</h2>
            <span className="section-badge fire-badge">🔥 {predictions.length} votes</span>
          </div>

          <div className="fan-favourites-grid">
            {fanFavourites.slice(0, 5).map((player, idx) => (
              <div key={player.player} className={`fan-fav-card ${idx === 0 ? 'leader' : ''}`}>
                <span className="fan-fav-rank">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                </span>
                {player.team && TEAMS[player.team] && (
                  <img src={TEAMS[player.team].logo} alt="" className="fan-fav-logo" />
                )}
                <span className="fan-fav-name">{player.player}</span>
                <span className="fan-fav-votes">{player.votes}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Poll Leaderboard */}
      {pollLeaderboard.length > 0 && (
        <section className="poll-leaders-section animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <div className="section-header">
            <h2 className="section-title">POLL LEADERBOARD</h2>
            <span className="section-badge coins-badge">💰 TOP WINNERS</span>
          </div>

          <div className="poll-leaders-list">
            {pollLeaderboard.map((user, idx) => (
              <div key={user.email} className={`poll-leader-row ${idx === 0 ? 'top-winner' : ''}`}>
                <span className="poll-leader-rank">
                  {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                </span>
                <div className="poll-leader-info">
                  <span className="poll-leader-name">{user.name}</span>
                  <span className="poll-leader-wins">{user.wins} correct prediction{user.wins !== 1 ? 's' : ''}</span>
                </div>
                <span className="poll-leader-coins">{user.coins}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Thank You Message */}
      <section className="thankyou-section animate-slide-up" style={{ animationDelay: '0.65s' }}>
        <div className="thankyou-card">
          <div className="thankyou-emoji">🙏</div>
          <h3 className="thankyou-title">Thank You!</h3>
          <p className="thankyou-text">
            Thanks to all players, organizers, and fans who made Scapia Offside 2026 unforgettable!
          </p>
          <div className="thankyou-hashtag">#ScapiaOffside2026</div>
        </div>
      </section>
    </div>
  );
};

export default TrophyTab;

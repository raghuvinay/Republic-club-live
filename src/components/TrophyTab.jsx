import { useMemo, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useApp } from '../contexts/AppContext';
import { TEAMS } from '../data/teams';
import './TrophyTab.css';

const TrophyTab = () => {
  const { matches, predictions, calculateTopScorers } = useApp();
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const shareCardRef = useRef(null);

  // Share text for WhatsApp
  const shareText = `🏆 *SCAPIA OFFSIDE 2026*

🥇 *CHAMPIONS: DHURANDHARS*
Won on penalties vs Userflow (1-1, 5-3 pens)

🏅 *AWARDS*
👟 Golden Boot: Avaneesh Kulkarni (8 goals)
🧤 Golden Glove: Sandipan
⭐ Man of Series: Ninad & Sumedh Zope

📊 *TOURNAMENT STATS*
⚽ 51 Goals in 13 Matches
🎯 3.9 Goals per Match
🎩 2 Hat-tricks

🔗 Full stats: https://raghuvinay.github.io/Republic-club-live/

#ScapiaOffside2026`;

  const handleShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadImage = async () => {
    if (!shareCardRef.current || generating) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: '#1a0a2e',
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      const link = document.createElement('a');
      link.download = 'scapia-offside-2026-champions.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
    setGenerating(false);
  };

  const handleShareImage = async () => {
    if (!shareCardRef.current || generating) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: '#1a0a2e',
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], 'scapia-offside-2026.png', { type: 'image/png' });
          try {
            await navigator.share({
              files: [file],
              title: 'Scapia Offside 2026 Champions',
              text: 'Dhurandhars are the champions! 🏆'
            });
          } catch (shareErr) {
            // If share fails, download instead
            const link = document.createElement('a');
            link.download = 'scapia-offside-2026-champions.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
          }
        } else {
          // Fallback to download
          const link = document.createElement('a');
          link.download = 'scapia-offside-2026-champions.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
        setGenerating(false);
      }, 'image/png');
    } catch (err) {
      console.error('Failed to generate image:', err);
      setGenerating(false);
    }
  };

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

  // Poll Leaderboard - users who won coins (matches PollsTab calculation)
  const PRIZE_POOL = 1000;
  const extractName = (email) => {
    if (!email) return '';
    return email.replace('@scapia.cards', '');
  };

  const pollLeaderboard = useMemo(() => {
    const earnings = {};

    matches.filter(m => m.momPublishedAt && m.momWinners?.length > 0).forEach(match => {
      const coinsPerWinner = Math.floor(PRIZE_POOL / match.momWinners.length);
      match.momWinners.forEach(winner => {
        const cleanName = extractName(winner);
        if (!earnings[cleanName]) {
          earnings[cleanName] = { name: cleanName, coins: 0, wins: 0 };
        }
        earnings[cleanName].coins += coinsPerWinner;
        earnings[cleanName].wins++;
      });
    });

    return Object.values(earnings)
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
            <span className="section-badge coins-badge">💰 TOP 10</span>
          </div>

          <div className="poll-leaders-list">
            {pollLeaderboard.map((player, idx) => (
              <div key={player.name} className={`poll-leader-row ${idx === 0 ? 'top-winner' : ''}`}>
                <span className="poll-leader-rank">
                  {idx === 0 ? '💰' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                </span>
                <div className="poll-leader-info">
                  <span className="poll-leader-name">{player.name}</span>
                  <span className="poll-leader-wins">{player.wins} win{player.wins !== 1 ? 's' : ''}</span>
                </div>
                <span className="poll-leader-coins">{player.coins}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Shareable Card (for image generation) */}
      <div className="share-card-wrapper">
        <div ref={shareCardRef} className="share-card">
          <div className="share-card-header">
            <span className="share-card-badge">SCAPIA OFFSIDE 2026</span>
          </div>
          <div className="share-card-trophy">🏆</div>
          <h2 className="share-card-title">CHAMPIONS</h2>
          <div className="share-card-team">
            <img src={champion?.logo} alt="" className="share-card-logo" crossOrigin="anonymous" />
            <span className="share-card-team-name">{champion?.name}</span>
          </div>
          <div className="share-card-final">
            <span>Final: DHU 1-1 UFU</span>
            <span className="share-card-pens">(5-3 on penalties)</span>
          </div>
          <div className="share-card-divider"></div>
          <div className="share-card-awards">
            <div className="share-card-award">
              <span className="award-emoji">👟</span>
              <div>
                <span className="award-label">Golden Boot</span>
                <span className="award-value">Avaneesh Kulkarni</span>
              </div>
            </div>
            <div className="share-card-award">
              <span className="award-emoji">🧤</span>
              <div>
                <span className="award-label">Golden Glove</span>
                <span className="award-value">Sandipan</span>
              </div>
            </div>
            <div className="share-card-award">
              <span className="award-emoji">⭐</span>
              <div>
                <span className="award-label">Man of Series</span>
                <span className="award-value">Ninad & Sumedh</span>
              </div>
            </div>
          </div>
          <div className="share-card-stats">
            <div className="share-stat"><span>51</span>Goals</div>
            <div className="share-stat"><span>13</span>Matches</div>
            <div className="share-stat"><span>2</span>Hat-tricks</div>
          </div>
          <div className="share-card-footer">
            <span className="share-card-hashtag">#ScapiaOffside2026</span>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <section className="share-section animate-slide-up" style={{ animationDelay: '0.75s' }}>
        <div className="section-header">
          <h2 className="section-title">SHARE THE GLORY</h2>
        </div>

        <div className="share-buttons">
          <button className="share-btn primary" onClick={handleShareImage} disabled={generating}>
            {generating ? (
              <>
                <div className="btn-spinner"></div>
                Generating...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="share-icon">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                Share Image
              </>
            )}
          </button>
          <button className="share-btn secondary" onClick={handleDownloadImage} disabled={generating}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="share-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
        </div>

        <div className="share-buttons-secondary">
          <button className="share-btn-small whatsapp" onClick={handleShare}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="share-icon-small">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Text
          </button>
          <button className="share-btn-small" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
        </div>
      </section>

      {/* Thank You Message */}
      <section className="thankyou-section animate-slide-up" style={{ animationDelay: '0.8s' }}>
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

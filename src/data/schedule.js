export const INITIAL_MATCHES = [
  {
    id: 'match-1',
    matchNumber: 1,
    home: 'feel-united',
    away: 'dhurandhars',
    date: '2025-01-29',
    time: '17:00',
    scoreHome: 0,
    scoreAway: 0,
    status: 'upcoming', // upcoming | live | ft
    goals: [],
    isFinal: false
  },
  {
    id: 'match-2',
    matchNumber: 2,
    home: 'userflow',
    away: 'goaldiggers',
    date: '2025-01-29',
    time: '17:30',
    scoreHome: 0,
    scoreAway: 0,
    status: 'upcoming',
    goals: [],
    isFinal: false
  },
  {
    id: 'match-3',
    matchNumber: 3,
    home: 'userflow',
    away: 'dhurandhars',
    date: '2025-01-29',
    time: '18:00',
    scoreHome: 0,
    scoreAway: 0,
    status: 'upcoming',
    goals: [],
    isFinal: false
  },
  {
    id: 'match-4',
    matchNumber: 4,
    home: 'goaldiggers',
    away: 'dhurandhars',
    date: '2025-01-29',
    time: '19:00',
    scoreHome: 0,
    scoreAway: 0,
    status: 'upcoming',
    goals: [],
    isFinal: false
  },
  {
    id: 'match-5',
    matchNumber: 5,
    home: 'feel-united',
    away: 'userflow',
    date: '2025-01-30',
    time: '18:00',
    scoreHome: 0,
    scoreAway: 0,
    status: 'upcoming',
    goals: [],
    isFinal: false
  },
  {
    id: 'match-6',
    matchNumber: 6,
    home: 'goaldiggers',
    away: 'feel-united',
    date: '2025-01-30',
    time: '18:30',
    scoreHome: 0,
    scoreAway: 0,
    status: 'upcoming',
    goals: [],
    isFinal: false
  },
  {
    id: 'match-7',
    matchNumber: 7,
    home: 'dhurandhars',
    away: 'userflow',
    date: '2025-01-30',
    time: '19:00',
    scoreHome: 0,
    scoreAway: 0,
    status: 'upcoming',
    goals: [],
    isFinal: false
  },
  {
    id: 'match-8',
    matchNumber: 8,
    home: 'goaldiggers',
    away: 'userflow',
    date: '2025-01-30',
    time: '19:30',
    scoreHome: 0,
    scoreAway: 0,
    status: 'upcoming',
    goals: [],
    isFinal: false
  },
  {
    id: 'match-9',
    matchNumber: 9,
    home: 'dhurandhars',
    away: 'feel-united',
    date: '2025-01-30',
    time: '20:00',
    scoreHome: 0,
    scoreAway: 0,
    status: 'upcoming',
    goals: [],
    isFinal: false
  },
  {
    id: 'match-10',
    matchNumber: 10,
    home: 'feel-united',
    away: 'goaldiggers',
    date: '2025-02-02',
    time: '18:00',
    scoreHome: 0,
    scoreAway: 0,
    status: 'upcoming',
    goals: [],
    isFinal: false
  },
  {
    id: 'match-11',
    matchNumber: 11,
    home: 'dhurandhars',
    away: 'goaldiggers',
    date: '2025-02-02',
    time: '18:30',
    scoreHome: 0,
    scoreAway: 0,
    status: 'upcoming',
    goals: [],
    isFinal: false
  },
  {
    id: 'match-12',
    matchNumber: 12,
    home: 'userflow',
    away: 'feel-united',
    date: '2025-02-02',
    time: '19:00',
    scoreHome: 0,
    scoreAway: 0,
    status: 'upcoming',
    goals: [],
    isFinal: false
  },
  {
    id: 'match-13',
    matchNumber: 13,
    home: 'tbd',
    away: 'tbd',
    date: '2025-02-02',
    time: '19:30',
    scoreHome: 0,
    scoreAway: 0,
    status: 'upcoming',
    goals: [],
    isFinal: true
  }
];

export const formatMatchDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export const formatMatchTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

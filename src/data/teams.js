export const TEAMS = {
  'feel-united': {
    id: 'feel-united',
    name: 'Feel United',
    shortName: 'FEE',
    color: '#FFFFFF',
    logo: 'https://res.cloudinary.com/scapiacards/image/upload/q_85/v1769249520/spitha_prod_uploads/2026_01/feel_united_1769249519167.webp',
    players: [
      'Ninad',
      'Aditya Thakur',
      'Umair',
      'Sagar Awasthi',
      'Sandipan Bala',
      'Gahan',
      'Rishab Khanna'
    ]
  },
  'dhurandhars': {
    id: 'dhurandhars',
    name: 'Dhurandhars',
    shortName: 'DHU',
    color: '#000000',
    logo: 'https://res.cloudinary.com/scapiacards/image/upload/q_85/v1769249469/spitha_prod_uploads/2026_01/durandhars_1769249467581.webp',
    players: [
      'Sagar Singh',
      'Raghu',
      'Sukhpal',
      'Mayank',
      'Manish Pandey',
      'Bharath Kumar',
      'Shashank'
    ]
  },
  'goaldiggers': {
    id: 'goaldiggers',
    name: 'The Goaldiggers',
    shortName: 'GDG',
    color: '#87CEEB',
    logo: 'https://res.cloudinary.com/scapiacards/image/upload/q_85/v1769249929/spitha_prod_uploads/2026_01/the_goaldiggers2_1769249927876.webp',
    players: [
      'Parth Jhawar',
      'Abdul Rehman',
      'Pratham P',
      'Durgesh Suthar',
      'Navdeep',
      'Rajendra Ranka',
      'Dhrouv Pujari'
    ]
  },
  'userflow': {
    id: 'userflow',
    name: 'Userflow United',
    shortName: 'UFU',
    color: '#FF0000',
    logo: 'https://res.cloudinary.com/scapiacards/image/upload/q_85/v1769249558/spitha_prod_uploads/2026_01/userflow_united_1769249557427.webp',
    players: [
      'Sumedh Zope',
      'Avaneesh Kulkarni',
      'Kushal',
      'Jalaj Varshney',
      'Anurag Kumar Singh',
      'Sandeep Xavier',
      'Hriday Bhatia'
    ]
  }
};

export const getTeam = (teamId) => TEAMS[teamId];
export const getAllTeams = () => Object.values(TEAMS);
export const getTeamPlayers = (teamId) => TEAMS[teamId]?.players || [];

import { useState } from 'react';
import HomePage from './components/HomePage';
import PitchBoard from './components/PitchBoard';
export default function App(){const [team,setTeam]=useState(null);return !team?<HomePage onCreateTeam={setTeam}/>:<PitchBoard team={team}/>}

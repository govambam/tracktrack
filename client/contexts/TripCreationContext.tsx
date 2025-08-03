import { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Round {
  id: string;
  courseName: string;
  date: string;
  time: string;
  holes: number;
  yardage?: string;
  skillsContests?: {
    enabled: boolean;
    holes: string;
  };
}

export interface Player {
  id: string;
  name: string;
  handicap?: number;
  image?: string;
}

export interface TripData {
  // Event ID for editing existing events
  id?: string;

  // Basic Info
  tripName: string;
  startDate: string;
  endDate: string;
  location: string;
  description?: string;
  bannerImage?: string;
  
  // Courses
  rounds: Round[];
  
  // Scoring
  scoringFormat: 'stroke-play' | 'modified-stableford';
  stablefordPoints?: {
    eagle: number;
    birdie: number;
    par: number;
    bogey: number;
    doubleBogey: number;
  };
  
  // Players
  players: Player[];
  
  // Prizes
  buyIn?: number;
  payoutStructure?: {
    champion?: number;
    runnerUp?: number;
    third?: number;
  };
  contestPrizes?: {
    longestDrive?: number;
    closestToPin?: number;
    other?: string;
  };
  
  // Travel
  travelInfo?: {
    flightTimes?: string;
    accommodations?: string;
    dailySchedule?: string;
  };
  
  // Customization
  customization?: {
    isPrivate: boolean;
    logoUrl?: string;
    customDomain?: string;
  };
}

interface TripCreationState {
  tripData: TripData;
  currentStep: number;
}

type TripCreationAction =
  | { type: 'UPDATE_BASIC_INFO'; payload: Partial<TripData> }
  | { type: 'UPDATE_COURSES'; payload: { rounds: Round[] } }
  | { type: 'UPDATE_SCORING'; payload: Partial<TripData> }
  | { type: 'UPDATE_PLAYERS'; payload: { players: Player[] } }
  | { type: 'UPDATE_PRIZES'; payload: Partial<TripData> }
  | { type: 'UPDATE_TRAVEL'; payload: Partial<TripData> }
  | { type: 'UPDATE_CUSTOMIZATION'; payload: Partial<TripData> }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'RESET_TRIP' }
  | { type: 'LOAD_EVENT'; payload: TripData };

const initialState: TripCreationState = {
  tripData: {
    tripName: '',
    startDate: '',
    endDate: '',
    location: '',
    rounds: [],
    scoringFormat: 'stroke-play',
    players: [],
    customization: {
      isPrivate: false,
    },
  },
  currentStep: 0,
};

function tripCreationReducer(state: TripCreationState, action: TripCreationAction): TripCreationState {
  switch (action.type) {
    case 'UPDATE_BASIC_INFO':
    case 'UPDATE_SCORING':
    case 'UPDATE_PRIZES':
    case 'UPDATE_TRAVEL':
    case 'UPDATE_CUSTOMIZATION':
      return {
        ...state,
        tripData: { ...state.tripData, ...action.payload },
      };
    case 'UPDATE_COURSES':
      return {
        ...state,
        tripData: { ...state.tripData, rounds: action.payload.rounds },
      };
    case 'UPDATE_PLAYERS':
      return {
        ...state,
        tripData: { ...state.tripData, players: action.payload.players },
      };
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'RESET_TRIP':
      return initialState;
    case 'LOAD_EVENT':
      return {
        ...state,
        tripData: action.payload,
      };
    default:
      return state;
  }
}

interface TripCreationContextType {
  state: TripCreationState;
  updateBasicInfo: (data: Partial<TripData>) => void;
  updateCourses: (rounds: Round[]) => void;
  updateScoring: (data: Partial<TripData>) => void;
  updatePlayers: (players: Player[]) => void;
  updatePrizes: (data: Partial<TripData>) => void;
  updateTravel: (data: Partial<TripData>) => void;
  updateCustomization: (data: Partial<TripData>) => void;
  setStep: (step: number) => void;
  resetTrip: () => void;
}

const TripCreationContext = createContext<TripCreationContextType | undefined>(undefined);

export function TripCreationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripCreationReducer, initialState);

  const contextValue: TripCreationContextType = {
    state,
    updateBasicInfo: (data) => dispatch({ type: 'UPDATE_BASIC_INFO', payload: data }),
    updateCourses: (rounds) => dispatch({ type: 'UPDATE_COURSES', payload: { rounds } }),
    updateScoring: (data) => dispatch({ type: 'UPDATE_SCORING', payload: data }),
    updatePlayers: (players) => dispatch({ type: 'UPDATE_PLAYERS', payload: { players } }),
    updatePrizes: (data) => dispatch({ type: 'UPDATE_PRIZES', payload: data }),
    updateTravel: (data) => dispatch({ type: 'UPDATE_TRAVEL', payload: data }),
    updateCustomization: (data) => dispatch({ type: 'UPDATE_CUSTOMIZATION', payload: data }),
    setStep: (step) => dispatch({ type: 'SET_STEP', payload: step }),
    resetTrip: () => dispatch({ type: 'RESET_TRIP' }),
  };

  return (
    <TripCreationContext.Provider value={contextValue}>
      {children}
    </TripCreationContext.Provider>
  );
}

export function useTripCreation() {
  const context = useContext(TripCreationContext);
  if (context === undefined) {
    throw new Error('useTripCreation must be used within a TripCreationProvider');
  }
  return context;
}

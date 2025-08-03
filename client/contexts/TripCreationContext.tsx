import { createContext, useContext, useReducer, ReactNode, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { safeFetch } from '@/lib/safeFetch';

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
  loadEvent: (eventData: TripData) => void;
  saveEvent: () => Promise<{ success: boolean; eventId?: string; error?: string }>;
}

const TripCreationContext = createContext<TripCreationContextType | undefined>(undefined);

export function TripCreationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripCreationReducer, initialState);
  const [isSaving, setIsSaving] = useState(false);

  const saveEvent = async (): Promise<{ success: boolean; eventId?: string; error?: string }> => {
    // Prevent concurrent saves
    if (isSaving) {
      console.log('Save already in progress, skipping...');
      return { success: false, error: 'Save already in progress' };
    }

    try {
      setIsSaving(true);
      const { tripData } = state;

      // Get current session for auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error in saveEvent:', sessionError);
        return { success: false, error: 'Authentication error - please sign in again' };
      }

      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      console.log('Save: Session found, access token length:', session.access_token?.length || 0);

      const eventData = {
        name: tripData.tripName,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        location: tripData.location,
        description: tripData.description || null,
        logo_url: tripData.bannerImage || null,
        is_private: tripData.customization?.isPrivate || false
      };

      console.log('Saving event with data:', eventData);

      // Use direct Supabase calls instead of server routes to avoid auth issues
      let data, error;

      if (tripData.id) {
        // Update existing event
        console.log('Updating existing event:', tripData.id);
        const updateResult = await supabase
          .from('events')
          .update({
            name: eventData.name,
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            location: eventData.location,
            description: eventData.description,
            logo_url: eventData.logo_url,
            is_private: eventData.is_private,
            updated_at: new Date().toISOString()
          })
          .eq('id', tripData.id)
          .select()
          .single();

        data = updateResult.data;
        error = updateResult.error;
      } else {
        // Create new event
        console.log('Creating new event');
        const insertResult = await supabase
          .from('events')
          .insert({
            user_id: session.user.id,
            name: eventData.name,
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            location: eventData.location,
            description: eventData.description,
            logo_url: eventData.logo_url,
            is_private: eventData.is_private
          })
          .select()
          .single();

        data = insertResult.data;
        error = insertResult.error;
      }

      if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: error.message || 'Database error' };
      }

      if (!data) {
        return { success: false, error: 'No data returned from database' };
      }

      console.log('Event saved successfully:', data.id);

      // Update local state with the saved event ID if this was a new event
      if (!tripData.id && data.id) {
        dispatch({
          type: 'UPDATE_BASIC_INFO',
          payload: { id: data.id }
        });
      }

      return { success: true, eventId: data.id };

    } catch (error) {
      console.error('Error saving event:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setIsSaving(false);
    }
  };

  const loadEvent = (eventData: TripData) => {
    dispatch({ type: 'LOAD_EVENT', payload: eventData });
  };

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
    loadEvent,
    saveEvent,
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

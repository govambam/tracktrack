import { createContext, useContext, useReducer, ReactNode, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
  saveEvent: (formData?: Partial<TripData>) => Promise<{ success: boolean; eventId?: string; error?: string }>;
  saveRounds: () => Promise<{ success: boolean; error?: string }>;
  savePlayers: () => Promise<{ success: boolean; error?: string }>;
  savePrizes: () => Promise<{ success: boolean; error?: string }>;
  saveTravel: () => Promise<{ success: boolean; error?: string }>;
  saveCustomization: () => Promise<{ success: boolean; error?: string }>;
}

const TripCreationContext = createContext<TripCreationContextType | undefined>(undefined);

export function TripCreationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripCreationReducer, initialState);
  const [isSaving, setIsSaving] = useState(false);

  const saveEvent = async (formData?: Partial<TripData>): Promise<{ success: boolean; eventId?: string; error?: string }> => {
    // Prevent concurrent saves
    if (isSaving) {
      console.log('Save already in progress, skipping...');
      return { success: false, error: 'Save already in progress' };
    }

    try {
      setIsSaving(true);
      // Use passed form data if provided, otherwise use context state
      const tripData = formData ? { ...state.tripData, ...formData } : state.tripData;

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

      // Validate required fields before saving
      if (!tripData.tripName || !tripData.tripName.trim()) {
        return { success: false, error: 'Event name is required' };
      }
      if (!tripData.startDate || !tripData.startDate.trim()) {
        return { success: false, error: 'Start date is required' };
      }
      if (!tripData.endDate || !tripData.endDate.trim()) {
        return { success: false, error: 'End date is required' };
      }
      if (!tripData.location || !tripData.location.trim()) {
        return { success: false, error: 'Location is required' };
      }

      // Validate date format (should be YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(tripData.startDate)) {
        return { success: false, error: `Invalid start date format: "${tripData.startDate}". Expected YYYY-MM-DD` };
      }
      if (!dateRegex.test(tripData.endDate)) {
        return { success: false, error: `Invalid end date format: "${tripData.endDate}". Expected YYYY-MM-DD` };
      }

      const eventData = {
        name: tripData.tripName.trim(),
        start_date: tripData.startDate.trim(),
        end_date: tripData.endDate.trim(),
        location: tripData.location.trim(),
        description: tripData.description?.trim() || null,
        logo_url: tripData.bannerImage?.trim() || null,
        is_private: tripData.customization?.isPrivate || false
      };

      console.log('Saving event with data:', eventData);
      console.log('User ID:', session.user.id);
      console.log('Trip data ID:', tripData.id);
      console.log('Date validation:', {
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        startDateType: typeof tripData.startDate,
        endDateType: typeof tripData.endDate,
        startDateLength: tripData.startDate?.length,
        endDateLength: tripData.endDate?.length
      });

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
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        console.error('Full error object:', JSON.stringify(error, null, 2));
        return { success: false, error: error.message || error.details || 'Database error' };
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

  const saveRounds = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { tripData } = state;
      if (!tripData.id) {
        return { success: false, error: 'Event must be saved first before adding rounds' };
      }

      console.log('Saving rounds for event:', tripData.id);

      // Delete existing rounds first
      const { error: deleteError } = await supabase
        .from('event_rounds')
        .delete()
        .eq('event_id', tripData.id);

      if (deleteError) {
        console.error('Error deleting existing rounds:', deleteError);
        return { success: false, error: deleteError.message };
      }

      // Insert new rounds
      if (tripData.rounds && tripData.rounds.length > 0) {
        const roundsData = tripData.rounds.map(round => ({
          event_id: tripData.id,
          course_name: round.courseName,
          round_date: round.date,
          tee_time: round.time || null,
          holes: round.holes || 18,
          scoring_type: tripData.scoringFormat === 'modified-stableford' ? 'stableford' : 'stroke_play'
        }));

        const { error: insertError } = await supabase
          .from('event_rounds')
          .insert(roundsData);

        if (insertError) {
          console.error('Error inserting rounds:', insertError);
          return { success: false, error: insertError.message };
        }
      }

      console.log('Rounds saved successfully');
      return { success: true };
    } catch (error) {
      console.error('Error saving rounds:', error);
      return { success: false, error: 'Failed to save rounds' };
    }
  };

  const savePlayers = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { tripData } = state;
      if (!tripData.id) {
        return { success: false, error: 'Event must be saved first before adding players' };
      }

      console.log('Saving players for event:', tripData.id);

      // Delete existing players first
      const { error: deleteError } = await supabase
        .from('event_players')
        .delete()
        .eq('event_id', tripData.id);

      if (deleteError) {
        console.error('Error deleting existing players:', deleteError);
        return { success: false, error: deleteError.message };
      }

      // Insert new players
      if (tripData.players && tripData.players.length > 0) {
        const playersData = tripData.players.map(player => ({
          event_id: tripData.id,
          full_name: player.name,
          handicap: player.handicap || null,
          profile_image: player.image || null
        }));

        const { error: insertError } = await supabase
          .from('event_players')
          .insert(playersData);

        if (insertError) {
          console.error('Error inserting players:', insertError);
          return { success: false, error: insertError.message };
        }
      }

      console.log('Players saved successfully');
      return { success: true };
    } catch (error) {
      console.error('Error saving players:', error);
      return { success: false, error: 'Failed to save players' };
    }
  };

  const savePrizes = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { tripData } = state;
      if (!tripData.id) {
        return { success: false, error: 'Event must be saved first before adding prizes' };
      }

      console.log('Saving prizes for event:', tripData.id);

      // Delete existing prizes first
      const { error: deleteError } = await supabase
        .from('event_prizes')
        .delete()
        .eq('event_id', tripData.id);

      if (deleteError) {
        console.error('Error deleting existing prizes:', deleteError);
        return { success: false, error: deleteError.message };
      }

      // Insert new prizes based on tripData structure
      const prizesData = [];

      // Add payout structure prizes
      if (tripData.payoutStructure) {
        if (tripData.payoutStructure.champion) {
          prizesData.push({
            event_id: tripData.id,
            category: 'overall_champion',
            amount: tripData.payoutStructure.champion,
            description: 'Overall Champion'
          });
        }
        if (tripData.payoutStructure.runnerUp) {
          prizesData.push({
            event_id: tripData.id,
            category: 'runner_up',
            amount: tripData.payoutStructure.runnerUp,
            description: 'Runner Up'
          });
        }
        if (tripData.payoutStructure.third) {
          prizesData.push({
            event_id: tripData.id,
            category: 'third_place',
            amount: tripData.payoutStructure.third,
            description: 'Third Place'
          });
        }
      }

      // Add contest prizes
      if (tripData.contestPrizes) {
        if (tripData.contestPrizes.longestDrive) {
          prizesData.push({
            event_id: tripData.id,
            category: 'longest_drive',
            amount: tripData.contestPrizes.longestDrive,
            description: 'Longest Drive'
          });
        }
        if (tripData.contestPrizes.closestToPin) {
          prizesData.push({
            event_id: tripData.id,
            category: 'closest_to_pin',
            amount: tripData.contestPrizes.closestToPin,
            description: 'Closest to Pin'
          });
        }
        if (tripData.contestPrizes.other) {
          prizesData.push({
            event_id: tripData.id,
            category: 'custom',
            amount: 0,
            description: tripData.contestPrizes.other
          });
        }
      }

      if (prizesData.length > 0) {
        const { error: insertError } = await supabase
          .from('event_prizes')
          .insert(prizesData);

        if (insertError) {
          console.error('Error inserting prizes:', insertError);
          return { success: false, error: insertError.message };
        }
      }

      console.log('Prizes saved successfully');
      return { success: true };
    } catch (error) {
      console.error('Error saving prizes:', error);
      return { success: false, error: 'Failed to save prizes' };
    }
  };

  const saveTravel = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { tripData } = state;
      if (!tripData.id) {
        return { success: false, error: 'Event must be saved first before adding travel info' };
      }

      console.log('Saving travel info for event:', tripData.id);

      const travelData = {
        event_id: tripData.id,
        flight_info: tripData.travelInfo?.flightTimes || null,
        accommodations: tripData.travelInfo?.accommodations || null,
        daily_schedule: tripData.travelInfo?.dailySchedule || null
      };

      // Use upsert to handle both insert and update
      const { error } = await supabase
        .from('event_travel')
        .upsert(travelData, { onConflict: 'event_id' });

      if (error) {
        console.error('Error saving travel info:', error);
        return { success: false, error: error.message };
      }

      console.log('Travel info saved successfully');
      return { success: true };
    } catch (error) {
      console.error('Error saving travel info:', error);
      return { success: false, error: 'Failed to save travel info' };
    }
  };

  const saveCustomization = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { tripData } = state;
      if (!tripData.id) {
        return { success: false, error: 'Event must be saved first before adding customization' };
      }

      console.log('Saving customization for event:', tripData.id);

      const customizationData = {
        event_id: tripData.id,
        logo_url: tripData.customization?.logoUrl || null,
        custom_domain: tripData.customization?.customDomain || null,
        is_private: tripData.customization?.isPrivate || false
      };

      // Use upsert to handle both insert and update
      const { error } = await supabase
        .from('event_customization')
        .upsert(customizationData, { onConflict: 'event_id' });

      if (error) {
        console.error('Error saving customization:', error);
        return { success: false, error: error.message };
      }

      console.log('Customization saved successfully');
      return { success: true };
    } catch (error) {
      console.error('Error saving customization:', error);
      return { success: false, error: 'Failed to save customization' };
    }
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
    saveRounds,
    savePlayers,
    savePrizes,
    saveTravel,
    saveCustomization,
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

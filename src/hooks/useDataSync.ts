import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

const SYNC_DEBOUNCE_MS = 2000;

async function syncToDatabase(userId: string, stateData: Record<string, unknown>): Promise<void> {
  try {
    console.log('Syncing user data to database...');
    const row = {
      user_id: userId,
      passport: stateData.passport as any,
      user_inputs: stateData.userInputs as any,
      validation: stateData.validation as any,
      milestones: stateData.milestones as any,
      applications: stateData.applications as any,
      team_members: stateData.teamMembers as any,
      funding_data: stateData.fundingData as any,
      tool_activation_count: stateData.toolActivationCount as number,
      subscribed_tools: stateData.subscribedTools as string[],
      applied_applications: stateData.appliedApplications as string[],
      applied_funding_routes: stateData.appliedFundingRoutes as string[],
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_data' as any)
      .upsert(row as any, { onConflict: 'user_id' });

    if (error) {
      console.error('Error syncing data to database:', error);
    } else {
      console.log('Successfully synced data to database');
    }
  } catch (error) {
    console.error('Error syncing data:', error);
  }
}

async function loadFromDatabase(userId: string): Promise<boolean> {
  try {
    console.log('Loading user data from database...');
    const { data, error } = await supabase
      .from('user_data' as any)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      console.log('No saved data found, using empty state');
      useStore.getState().hydrateState({ dataLoaded: true } as any);
      return false;
    }

    const row = data as any;
    const store = useStore.getState();

    // Hydrate passport
    if (row.passport && Object.keys(row.passport).length > 0 && row.passport.startupName) {
      store.updatePassport({
        ...row.passport,
        lastUpdated: row.passport.lastUpdated ? new Date(row.passport.lastUpdated) : new Date(),
      });
    }

    // Hydrate validation
    if (row.validation && (row.validation.marketFit > 0 || row.validation.problemValidation > 0)) {
      store.setValidation(row.validation);
    }

    // Hydrate milestones
    if (row.milestones && Array.isArray(row.milestones) && row.milestones.length > 0) {
      store.setMilestones(row.milestones);
    }

    // Hydrate applications
    if (row.applications && Array.isArray(row.applications) && row.applications.length > 0) {
      // Restore applied status
      const appliedIds = row.applied_applications || [];
      const apps = row.applications.map((a: any) => ({
        ...a,
        applied: appliedIds.includes(a.id) || a.applied,
      }));
      store.setApplications(apps);
    }

    // Hydrate team members
    if (row.team_members && Array.isArray(row.team_members) && row.team_members.length > 0) {
      store.setTeamMembers(row.team_members);
    }

    // Hydrate funding data
    if (row.funding_data && row.funding_data.current_stage) {
      const appliedRouteIds = row.applied_funding_routes || [];
      const fundingData = {
        ...row.funding_data,
        funding_routes: (row.funding_data.funding_routes || []).map((r: any) => ({
          ...r,
          applied: appliedRouteIds.includes(r.id) || r.applied,
        })),
      };
      store.setFundingData(fundingData);
    }

    // Hydrate tool subscriptions
    if (row.subscribed_tools && row.subscribed_tools.length > 0) {
      row.subscribed_tools.forEach((toolId: string) => {
        store.markToolSubscribed(toolId);
      });
    }

    // Hydrate user inputs
    if (row.user_inputs && Object.keys(row.user_inputs).length > 0) {
      Object.entries(row.user_inputs).forEach(([key, value]) => {
        store.updateUserInput(key, value as string);
      });
    }

    // Check if onboarding was completed
    if (row.onboarding_profile && Object.keys(row.onboarding_profile).length > 0) {
      store.setOnboardingComplete(true);
    }

    store.hydrateState({ dataLoaded: true } as any);
    console.log('Successfully loaded data from database');
    return true;
  } catch (error) {
    console.error('Error loading data:', error);
    useStore.getState().hydrateState({ dataLoaded: true } as any);
    return false;
  }
}

export function useDataSync() {
  const { user } = useAuth();
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncRef = useRef<string>('');
  const hasLoadedRef = useRef(false);

  const passport = useStore((state) => state.passport);
  const userInputs = useStore((state) => state.userInputs);
  const validation = useStore((state) => state.validation);
  const milestones = useStore((state) => state.twelveMonthMilestones);
  const applications = useStore((state) => state.applications);
  const teamMembers = useStore((state) => state.teamMembers);
  const fundingData = useStore((state) => state.fundingData);
  const toolActivationCount = useStore((state) => state.toolActivationCount);
  const tools = useStore((state) => state.tools);
  const dataLoaded = useStore((state) => state.dataLoaded);

  // Load data from DB on first mount
  useEffect(() => {
    if (!user || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadFromDatabase(user.id);
  }, [user]);

  // Sync to DB on state changes (only after initial load)
  useEffect(() => {
    if (!user || !dataLoaded) return;
    const userId = user.id;

    const stateHash = JSON.stringify({
      passport, userInputs, validation, milestones, applications, teamMembers, fundingData, toolActivationCount
    });

    if (stateHash === lastSyncRef.current) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncToDatabase(userId, {
        passport, userInputs, validation, milestones, applications, teamMembers, fundingData, toolActivationCount,
        subscribedTools: tools.filter(t => t.subscribed).map(t => t.id),
        appliedApplications: applications.filter(a => a.applied).map(a => a.id),
        appliedFundingRoutes: fundingData.funding_routes.filter(r => r.applied).map(r => r.id)
      });
      lastSyncRef.current = stateHash;
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, dataLoaded, passport, userInputs, validation, milestones, applications, teamMembers, fundingData, toolActivationCount, tools]);

  const forceSync = () => {
    if (!user) return;
    const state = useStore.getState();
    syncToDatabase(user.id, {
      passport: state.passport, userInputs: state.userInputs, validation: state.validation,
      milestones: state.twelveMonthMilestones, applications: state.applications, teamMembers: state.teamMembers,
      fundingData: state.fundingData, toolActivationCount: state.toolActivationCount,
      subscribedTools: state.tools.filter(t => t.subscribed).map(t => t.id),
      appliedApplications: state.applications.filter(a => a.applied).map(a => a.id),
      appliedFundingRoutes: state.fundingData.funding_routes.filter(r => r.applied).map(r => r.id)
    });
  };

  return { forceSync };
}

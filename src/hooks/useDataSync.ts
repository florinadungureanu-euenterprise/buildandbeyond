import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { getUserId } from './useUserId';
import { supabase } from '@/integrations/supabase/client';

// Debounce time in milliseconds
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

export function useDataSync() {
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncRef = useRef<string>('');

  // Get all relevant state
  const passport = useStore((state) => state.passport);
  const userInputs = useStore((state) => state.userInputs);
  const validation = useStore((state) => state.validation);
  const milestones = useStore((state) => state.twelveMonthMilestones);
  const applications = useStore((state) => state.applications);
  const teamMembers = useStore((state) => state.teamMembers);
  const fundingData = useStore((state) => state.fundingData);
  const toolActivationCount = useStore((state) => state.toolActivationCount);
  const tools = useStore((state) => state.tools);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    // Create a hash of current state to detect changes
    const stateHash = JSON.stringify({
      passport,
      userInputs,
      validation,
      milestones,
      applications,
      teamMembers,
      fundingData,
      toolActivationCount
    });

    // Skip if no actual change
    if (stateHash === lastSyncRef.current) return;

    // Clear any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce the sync
    syncTimeoutRef.current = setTimeout(() => {
      syncToDatabase(userId, {
        passport,
        userInputs,
        validation,
        milestones,
        applications,
        teamMembers,
        fundingData,
        toolActivationCount,
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
  }, [passport, userInputs, validation, milestones, applications, teamMembers, fundingData, toolActivationCount, tools]);

  // Return a function to force immediate sync
  const forceSync = () => {
    const userId = getUserId();
    if (!userId) return;

    const state = useStore.getState();

    syncToDatabase(userId, {
      passport: state.passport,
      userInputs: state.userInputs,
      validation: state.validation,
      milestones: state.twelveMonthMilestones,
      applications: state.applications,
      teamMembers: state.teamMembers,
      fundingData: state.fundingData,
      toolActivationCount: state.toolActivationCount,
      subscribedTools: state.tools.filter(t => t.subscribed).map(t => t.id),
      appliedApplications: state.applications.filter(a => a.applied).map(a => a.id),
      appliedFundingRoutes: state.fundingData.funding_routes.filter(r => r.applied).map(r => r.id)
    });
  };

  return { forceSync };
}

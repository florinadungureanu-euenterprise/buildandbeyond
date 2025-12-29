import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { getUserId } from './useUserId';

const N8N_SYNC_WEBHOOK_URL = 'https://springervc.app.n8n.cloud/webhook/user-data-sync';

// Debounce time in milliseconds
const SYNC_DEBOUNCE_MS = 2000;

interface SyncPayload {
  user_id: string;
  timestamp: string;
  event_type: 'state_update' | 'full_sync';
  data: {
    passport: ReturnType<typeof useStore.getState>['passport'];
    userInputs: ReturnType<typeof useStore.getState>['userInputs'];
    validation: ReturnType<typeof useStore.getState>['validation'];
    milestones: ReturnType<typeof useStore.getState>['twelveMonthMilestones'];
    applications: ReturnType<typeof useStore.getState>['applications'];
    teamMembers: ReturnType<typeof useStore.getState>['teamMembers'];
    fundingData: ReturnType<typeof useStore.getState>['fundingData'];
    toolActivationCount: number;
    subscribedTools: string[];
    appliedApplications: string[];
    appliedFundingRoutes: string[];
  };
}

async function syncToN8n(payload: SyncPayload): Promise<void> {
  try {
    console.log('Syncing user data to n8n:', payload.event_type);
    
    await fetch(N8N_SYNC_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      body: JSON.stringify(payload),
    });
    
    console.log('Successfully synced data to n8n');
  } catch (error) {
    console.error('Error syncing data to n8n:', error);
  }
}

export function useDataSync() {
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
      const payload: SyncPayload = {
        user_id: userId,
        timestamp: new Date().toISOString(),
        event_type: 'state_update',
        data: {
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
        }
      };

      syncToN8n(payload);
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
    
    const payload: SyncPayload = {
      user_id: userId,
      timestamp: new Date().toISOString(),
      event_type: 'full_sync',
      data: {
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
      }
    };

    syncToN8n(payload);
  };

  return { forceSync };
}

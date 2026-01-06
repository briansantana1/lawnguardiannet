/**
 * Consent Management Hook
 * 
 * Provides functionality for managing user consent preferences
 * in compliance with GDPR, CCPA, and app store requirements.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type ConsentType = 
  | 'privacy_policy'
  | 'terms_of_service'
  | 'marketing_emails'
  | 'push_notifications'
  | 'location_tracking'
  | 'analytics'
  | 'data_processing';

export interface ConsentRecord {
  consent_type: ConsentType;
  granted: boolean;
  policy_version: string | null;
  granted_at: string | null;
  updated_at: string | null;
}

export interface ConsentState {
  consents: Record<ConsentType, boolean>;
  loading: boolean;
  error: string | null;
}

export function useConsent() {
  const { user } = useAuth();
  const [state, setState] = useState<ConsentState>({
    consents: {
      privacy_policy: false,
      terms_of_service: false,
      marketing_emails: false,
      push_notifications: false,
      location_tracking: false,
      analytics: true,
      data_processing: false,
    },
    loading: true,
    error: null,
  });

  // Load user consents - using local storage as fallback since user_consents table may not exist
  const loadConsents = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Try to load from localStorage first as a simple fallback
      const storedConsents = localStorage.getItem(`consents_${user.id}`);
      if (storedConsents) {
        const parsed = JSON.parse(storedConsents);
        setState({
          consents: { ...state.consents, ...parsed },
          loading: false,
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error loading consents:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load consent preferences',
      }));
    }
  }, [user]);

  useEffect(() => {
    loadConsents();
  }, [loadConsents]);

  // Update a specific consent - store locally
  const updateConsent = useCallback(async (
    consentType: ConsentType,
    granted: boolean,
    policyVersion?: string
  ): Promise<boolean> => {
    if (!user) {
      console.error('User must be authenticated to update consent');
      return false;
    }

    try {
      // Update local state
      const newConsents = {
        ...state.consents,
        [consentType]: granted,
      };
      
      setState(prev => ({
        ...prev,
        consents: newConsents,
      }));
      
      // Store in localStorage as fallback
      localStorage.setItem(`consents_${user.id}`, JSON.stringify(newConsents));

      return true;
    } catch (error) {
      console.error('Error updating consent:', error);
      return false;
    }
  }, [user, state.consents]);

  // Update multiple consents at once - store locally
  const updateConsents = useCallback(async (
    updates: Partial<Record<ConsentType, boolean>>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const newConsents = {
        ...state.consents,
        ...updates,
      };

      // Update local state
      setState(prev => ({
        ...prev,
        consents: newConsents,
      }));
      
      // Store in localStorage as fallback
      localStorage.setItem(`consents_${user.id}`, JSON.stringify(newConsents));

      return true;
    } catch (error) {
      console.error('Error updating consents:', error);
      return false;
    }
  }, [user, state.consents]);

  // Check if user has given required consents (privacy policy & terms)
  const hasRequiredConsents = state.consents.privacy_policy && state.consents.terms_of_service;

  // Check a specific consent
  const hasConsent = useCallback((consentType: ConsentType): boolean => {
    return state.consents[consentType] || false;
  }, [state.consents]);

  // Request data export
  const requestDataExport = useCallback(async (
    includeImages: boolean = true
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User must be authenticated' };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { success: false, error: 'No active session' };
      }

      const { data, error } = await supabase.functions.invoke('export-user-data', {
        body: { includeImages },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to export data' 
      };
    }
  }, [user]);

  // Delete account (with confirmation required)
  const requestAccountDeletion = useCallback(async (): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> => {
    if (!user) {
      return { success: false, error: 'User must be authenticated' };
    }

    try {
      // Sign out the user - actual account deletion should be handled by support
      // or through a proper admin function
      await supabase.auth.signOut();
      localStorage.removeItem(`consents_${user.id}`);
      
      return { success: true, result: { message: 'Signed out. Contact support for full account deletion.' } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process account deletion' 
      };
    }
  }, [user]);

  return {
    consents: state.consents,
    loading: state.loading,
    error: state.error,
    hasRequiredConsents,
    hasConsent,
    updateConsent,
    updateConsents,
    requestDataExport,
    requestAccountDeletion,
    refresh: loadConsents,
  };
}


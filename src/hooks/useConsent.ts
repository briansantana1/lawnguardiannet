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

  // Load user consents
  const loadConsents = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('consent_type, granted')
        .eq('user_id', user.id);

      if (error) throw error;

      const consents = { ...state.consents };
      data?.forEach((record) => {
        consents[record.consent_type as ConsentType] = record.granted;
      });

      setState({
        consents,
        loading: false,
        error: null,
      });
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

  // Update a specific consent
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
      const { error } = await supabase.rpc('record_consent', {
        consent_user_id: user.id,
        consent_type_param: consentType,
        granted_param: granted,
        policy_version_param: policyVersion || null,
        consent_method_param: 'settings',
      });

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        consents: {
          ...prev.consents,
          [consentType]: granted,
        },
      }));

      return true;
    } catch (error) {
      console.error('Error updating consent:', error);
      return false;
    }
  }, [user]);

  // Update multiple consents at once
  const updateConsents = useCallback(async (
    updates: Partial<Record<ConsentType, boolean>>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const promises = Object.entries(updates).map(([type, granted]) =>
        supabase.rpc('record_consent', {
          consent_user_id: user.id,
          consent_type_param: type,
          granted_param: granted,
          consent_method_param: 'settings',
        })
      );

      await Promise.all(promises);

      // Update local state
      setState(prev => ({
        ...prev,
        consents: {
          ...prev.consents,
          ...updates,
        },
      }));

      return true;
    } catch (error) {
      console.error('Error updating consents:', error);
      return false;
    }
  }, [user]);

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
      const { data, error } = await supabase.rpc('delete_user_account_v2', {
        target_user_id: user.id,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, result: data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete account' 
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


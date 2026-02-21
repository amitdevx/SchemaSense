'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';

export interface Database {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  status: string;
  tables: number;
  lastSync: string;
  lastAnalyzed: string;
  schema_filter?: string;
  is_active?: boolean;
}

export interface ConnectionItem {
  id: string;
  name: string;
  host: string;
  port: number;
  database: string;
  schema_filter: string;
  is_active: boolean;
  connected_at: string;
  database_type?: string;
}

/**
 * Hook to fetch all connections
 */
export function useConnections(refetchTrigger?: number) {
  const [data, setData] = useState<ConnectionItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result: any = await api.getConnections();
      setData(result.connections || []);
      setActiveId(result.active_id || null);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch connections');
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections, refetchTrigger]);

  const activateConnection = async (connectionId: string) => {
    try {
      await api.activateConnection(connectionId);
      await fetchConnections();
    } catch (err: any) {
      setError(err?.message || 'Failed to activate connection');
    }
  };

  const removeConnection = async (connectionId: string) => {
    try {
      await api.removeConnection(connectionId);
      await fetchConnections();
    } catch (err: any) {
      setError(err?.message || 'Failed to remove connection');
    }
  };

  return { data, activeId, loading, error, refetch: fetchConnections, activateConnection, removeConnection };
}

/**
 * Hook to fetch list of connected databases
 */
export function useDatabases(refetchTrigger?: number) {
  const [data, setData] = useState<Database[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading(true);
        setError(null);
        const result: any = await api.getDatabases();
        setData(result.databases || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch databases');
        console.error('Error fetching databases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabases();
  }, [refetchTrigger]);

  return { data, loading, error };
}

export interface Statistics {
  connectedDatabases: number;
  totalTables: number;
  analysesRun: number;
}

/**
 * Hook to fetch dashboard statistics
 */
export function useStatistics(refetchTrigger?: number) {
  const [data, setData] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getStatistics();
        setData(result);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch statistics');
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refetchTrigger]);

  return { data, loading, error };
}

export interface SyncStatus {
  status: string;
  lastSync: string | null;
  syncFrequency: string;
}

/**
 * Hook to fetch sync status
 */
export function useSyncStatus() {
  const [data, setData] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getSyncStatus();
        setData(result);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch sync status');
        console.error('Error fetching sync status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return { data, loading, error };
}

export interface ConnectionInfo {
  connected: boolean;
  host?: string;
  database?: string;
  port?: number;
  message?: string;
}

/**
 * Hook to fetch connection information
 */
export function useConnectionInfo() {
  const [data, setData] = useState<ConnectionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnectionInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getConnectionStatus();
        setData(result);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch connection info');
        console.error('Error fetching connection info:', err);
        setData({ connected: false });
      } finally {
        setLoading(false);
      }
    };

    fetchConnectionInfo();
  }, []);

  return { data, loading, error };
}

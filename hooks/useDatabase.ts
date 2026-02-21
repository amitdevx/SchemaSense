'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

export interface Table {
  tables: string[];
  count: number;
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  is_pk: boolean;
}

export interface Schema {
  table_name: string;
  columns: Column[];
  row_count: number;
}

/**
 * Hook to fetch list of tables
 */
export function useTables(connectionId?: string | null) {
  const [data, setData] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        setError(null);
        setData(null);
        const result = await api.getTables(connectionId || undefined);
        setData(result);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch tables');
        console.error('Error fetching tables:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [connectionId]);

  return { data, loading, error };
}

/**
 * Hook to fetch schema for a specific table
 */
export function useTableSchema(tableName: string | null, connectionId?: string | null) {
  const [data, setData] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableName) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchSchema = async () => {
      try {
        setLoading(true);
        setError(null);
        setData(null);
        const result = await api.getSchema(tableName, connectionId || undefined);
        setData(result);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch schema');
        console.error('Error fetching schema:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, [tableName, connectionId]);

  return { data, loading, error };
}

/**
 * Hook to fetch data quality metrics
 */
export function useDataQuality(tableName: string | null, connectionId?: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableName) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchQuality = async () => {
      try {
        setLoading(true);
        setError(null);
        setData(null);
        const result = await api.getQuality(tableName, connectionId || undefined);
        setData(result);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch quality metrics');
        console.error('Error fetching quality:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuality();
  }, [tableName, connectionId]);

  return { data, loading, error };
}

/**
 * Hook to fetch sample data from a table
 */
export function useSampleData(tableName: string | null, limit: number = 5, connectionId?: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableName) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchSamples = async () => {
      try {
        setLoading(true);
        setError(null);
        setData(null);
        const result = await api.getSampleData(tableName, limit, connectionId || undefined);
        setData(result);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch sample data');
        console.error('Error fetching sample data:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSamples();
  }, [tableName, limit, connectionId]);

  return { data, loading, error };
}

/**
 * Hook to fetch table explanation/business context from AI
 */
export function useTableExplanation(tableName: string | null, connectionId?: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableName) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchExplanation = async () => {
      try {
        setLoading(true);
        setError(null);
        setData(null);
        const result = await api.explainTable(tableName, connectionId || undefined);
        setData(result);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch table explanation');
        console.error('Error fetching explanation:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [tableName, connectionId]);

  return { data, loading, error };
}

import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useBuilderConfig<T>(key: string, defaultData: T) {
  const [data, setData] = useState<T>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [globalConfig, setGlobalConfig] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    api.getBuilderConfig().then(res => {
      if (mounted) {
        setGlobalConfig(res?.builderConfig || {});
        if (res?.builderConfig && res.builderConfig[key] !== undefined) {
          const val = res.builderConfig[key];
          if (Array.isArray(defaultData)) {
            setData(Array.isArray(val) ? (val as T) : defaultData);
          } else {
            setData(val !== null && val !== undefined ? (val as T) : defaultData);
          }
        }
        setIsLoading(false);
      }
    }).catch(err => {
      console.warn('Config fetch notice, using fallback defaults:', err?.message || err);
      if (mounted) {
        setData(defaultData);
        setIsLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [key]);

  const updateConfig = async (newData: T, auditLogMessage?: string) => {
    setData(newData);
    setIsSaving(true);
    try {
      await api.updateBuilderConfig({ [key]: newData });
      if (auditLogMessage) {
        await api.createAuditLog({ 
        action: "UPDATE_CONFIG", 
        details: auditLogMessage || `Updated ${key} configuration` 
      });
      }
    } catch (err) {
      console.error('Failed to save config', err);
    } finally {
      setIsSaving(false);
    }
  };

  return { data, updateConfig, isLoading, isSaving, globalConfig };
}

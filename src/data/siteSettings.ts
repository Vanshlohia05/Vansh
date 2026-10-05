import { supabase } from '../utils/supabase';

const SETTINGS_STORAGE_PREFIX = 'vansh_site_setting_';

export async function fetchSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (!error && data && data.value !== undefined) {
      const val = data.value as T;
      try {
        localStorage.setItem(SETTINGS_STORAGE_PREFIX + key, JSON.stringify(val));
      } catch (e) {
        // ignore local storage error
      }
      return val;
    }
  } catch (err) {
    console.warn(`Error fetching setting ${key}:`, err);
  }

  // Fallback to local storage or defaultValue
  try {
    const cached = localStorage.getItem(SETTINGS_STORAGE_PREFIX + key);
    if (cached !== null) {
      return JSON.parse(cached) as T;
    }
  } catch (e) {
    // ignore
  }

  return defaultValue;
}

export function loadSetting<T>(key: string, defaultValue: T): T {
  try {
    const cached = localStorage.getItem(SETTINGS_STORAGE_PREFIX + key);
    if (cached !== null) {
      return JSON.parse(cached) as T;
    }
  } catch (e) {
    // ignore
  }
  return defaultValue;
}

export async function updateSetting<T>(key: string, value: T): Promise<boolean> {
  try {
    localStorage.setItem(SETTINGS_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    // ignore
  }

  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value: value as any, updated_at: new Date().toISOString() });

    if (error) {
      console.warn(`Error updating setting ${key} in Supabase:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`Network error updating setting ${key}:`, err);
    return false;
  }
}

export function subscribeToSetting<T>(key: string, onChange: (value: T) => void) {
  const channel = supabase
    .channel(`setting_${key}_stream`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'site_settings',
        filter: `key=eq.${key}`,
      },
      (payload) => {
        if (payload.new && (payload.new as any).value !== undefined) {
          const val = (payload.new as any).value as T;
          try {
            localStorage.setItem(SETTINGS_STORAGE_PREFIX + key, JSON.stringify(val));
          } catch (e) {
            // ignore
          }
          onChange(val);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

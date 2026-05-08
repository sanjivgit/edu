import { useEffect, useMemo, useState } from 'react';
import type { SettingsPayload } from '../validations/settings.schema';
import { useGetSettings } from '../services/settings.service';

export function useSettingsState() {
  const query = useGetSettings();
  const [draft, setDraft] = useState<SettingsPayload | null>(null);

  useEffect(() => {
    if (!query.data) return;
    setDraft(query.data);
  }, [query.data]);

  const isReady = useMemo(() => !!draft, [draft]);

  return {
    query,
    draft,
    setDraft,
    isReady,
  };
}


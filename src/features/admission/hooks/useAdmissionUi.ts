import { useMemo } from 'react';
import { useGetAdmissions } from '../services/admission.service';

export function useAdmissionStats() {
  const admissionsQuery = useGetAdmissions();
  const admissions = admissionsQuery.data ?? [];

  const stats = useMemo(() => {
    const total = admissions.length;
    const pending = admissions.filter((item) => item.status === 'pending').length;
    const approved = admissions.filter((item) => item.status === 'approved').length;
    const rejected = admissions.filter((item) => item.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [admissions]);

  return { admissionsQuery, admissions, stats };
}

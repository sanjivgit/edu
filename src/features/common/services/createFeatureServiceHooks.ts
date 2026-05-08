import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
// import type { FeatureCrudService, any } from './featureCrudFactory';

interface CreateFeatureServiceHooksOptions {
  queryKey: string;
  entityLabel: string;
  service: any;
}

export function createFeatureServiceHooks({
  queryKey,
  entityLabel,
  service,
}: CreateFeatureServiceHooksOptions) {
  const useGetRecords = () =>
    useQuery({
      queryKey: [queryKey],
      queryFn: service.list,
    });

  const useGetRecordById = (id: string | null) =>
    useQuery({
      queryKey: [queryKey, id],
      queryFn: () => service.getById(id!),
      enabled: !!id,
    });

  const useAddRecord = () =>
    useAppMutation<any, { name: string }>({
      mutationFn: async (body) => service.create(body.name),
      successMsg: `${entityLabel} created successfully`,
      errorMsg: `Failed to create ${entityLabel.toLowerCase()}`,
      invalidateQueryKeys: [queryKey],
    });

  const useEditRecord = () =>
    useAppMutation<any, { id: string; payload: Pick<any, 'name' | 'status'> }>({
      mutationFn: async (body) => service.update(body.id, body.payload),
      successMsg: `${entityLabel} updated successfully`,
      errorMsg: `Failed to update ${entityLabel.toLowerCase()}`,
      invalidateQueryKeys: [queryKey],
    });

  const useDeleteRecord = () =>
    useAppMutation<{ id: string }, { id: string }>({
      mutationFn: async (body) => service.remove(body.id),
      successMsg: `${entityLabel} deleted successfully`,
      errorMsg: `Failed to delete ${entityLabel.toLowerCase()}`,
      invalidateQueryKeys: [queryKey],
    });

  return {
    useGetRecords,
    useGetRecordById,
    useAddRecord,
    useEditRecord,
    useDeleteRecord,
  };
}

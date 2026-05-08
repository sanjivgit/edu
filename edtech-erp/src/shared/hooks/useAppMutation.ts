import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks';

interface UseAppMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMsg?: string;
  errorMsg?: string;
  invalidateQueryKeys?: Array<string | readonly unknown[]>;
}

export function useAppMutation<TData, TVariables>({
  mutationFn,
  successMsg = 'Action completed successfully.',
  errorMsg = 'Something went wrong.',
  invalidateQueryKeys = [],
}: UseAppMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      success('Success', successMsg);
      invalidateQueryKeys.forEach((key) => {
        queryClient.invalidateQueries({
          queryKey: Array.isArray(key) ? [...key] : [key],
        });
      });
    },
    onError: () => {
      error('Failed', errorMsg);
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks';

interface AppMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMsg: string;
  errorMsg: string;
  invalidateQueryKeys?: Array<string | readonly unknown[]>;
  onSuccessNotificationVisible?: boolean;
  onErrorNotificationVisible?: boolean;
}

export function useAppMutation<TData, TVariables>({
  mutationFn,
  successMsg,
  errorMsg,
  invalidateQueryKeys = [],
  onSuccessNotificationVisible = true,
  onErrorNotificationVisible = true,
}: AppMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      if (onSuccessNotificationVisible) {
        success('Success', successMsg);
      }
      invalidateQueryKeys.forEach((key) => {
        queryClient.invalidateQueries({
          queryKey: Array.isArray(key) ? [...key] : [key],
        });
      });
    },
    onError: () => {
      if (onErrorNotificationVisible) {
        error('Failed', errorMsg);
      }
    },
  });
}

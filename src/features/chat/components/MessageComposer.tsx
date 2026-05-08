import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { sendMessageSchema, type SendMessagePayload } from '../validations/chat.schema';

export function MessageComposer({
  conversationId,
  onSend,
  isSending = false,
}: {
  conversationId: string;
  onSend: (payload: { conversationId: string; text: string }) => void;
  isSending?: boolean;
}) {
  const form = useForm<SendMessagePayload>({
    resolver: yupResolver(sendMessageSchema),
    defaultValues: { conversationId, text: '' },
  });

  const onSubmit = (values: SendMessagePayload) => {
    onSend({ conversationId, text: values.text });
    form.reset({ conversationId, text: '' });
  };

  return (
    <Card className="p-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input label="" placeholder="Type a message..." {...form.register('text')} />
        </div>
        <Button
          size="sm"
          leftIcon={<Send className="h-4 w-4" />}
          onClick={form.handleSubmit(onSubmit)}
          isLoading={isSending}
        >
          Send
        </Button>
      </div>
      {form.formState.errors.text?.message && (
        <p className="mt-2 text-xs text-destructive">{form.formState.errors.text.message}</p>
      )}
    </Card>
  );
}


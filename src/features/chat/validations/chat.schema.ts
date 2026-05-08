import * as yup from 'yup';

export const sendMessageSchema = yup.object({
  conversationId: yup.string().required('Conversation is required'),
  text: yup.string().trim().required('Message is required').max(500, 'Message is too long'),
});

export type SendMessagePayload = yup.InferType<typeof sendMessageSchema>;


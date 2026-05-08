import * as yup from 'yup';

export const createAlbumSchema = yup.object({
  title: yup.string().trim().required('Album title is required'),
  description: yup.string().nullable().default(''),
  date: yup.string().required('Date is required'),
  visibility: yup.string().oneOf(['public', 'students', 'parents', 'staff']).required('Visibility is required'),
});

export const updateAlbumSchema = createAlbumSchema.shape({
  id: yup.string().required('Album id is required'),
});

export const addMediaSchema = yup.object({
  albumId: yup.string().required('Album id is required'),
  caption: yup.string().nullable().default(''),
  url: yup.string().trim().required('Media URL is required'),
  type: yup.string().oneOf(['image', 'video']).required('Media type is required'),
});

export type CreateAlbumPayload = yup.InferType<typeof createAlbumSchema>;
export type UpdateAlbumPayload = yup.InferType<typeof updateAlbumSchema>;
export type AddMediaPayload = yup.InferType<typeof addMediaSchema>;


import { useQuery } from '@tanstack/react-query';
import apiClient, { unwrapApi } from '@/lib/apiClient';
import type { ApiResponse } from '@/types';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';

export type AlbumVisibility = 'public' | 'students' | 'parents' | 'staff';
export type MediaType = 'image' | 'video';

export interface AlbumRecord {
  id: string;
  title: string;
  description?: string;
  date: string; // yyyy-mm-dd
  visibility: AlbumVisibility;
  coverUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  albumId: string;
  type: MediaType;
  url: string;
  caption?: string;
  createdAt: string;
}

const API = '/gallery';

interface BackendAlbum {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  visibility: AlbumVisibility;
  coverUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BackendMedia {
  id: string;
  albumId: string;
  type: MediaType;
  url: string;
  caption?: string | null;
  createdAt: string;
}

function toDateString(value?: string): string {
  return (value ?? '').split('T')[0];
}

function toAlbumRecord(a: BackendAlbum): AlbumRecord {
  return {
    id: a.id,
    title: a.title,
    description: a.description ?? '',
    date: toDateString(a.date),
    visibility: a.visibility,
    coverUrl: a.coverUrl ?? '',
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

function toMediaItem(m: BackendMedia): MediaItem {
  return {
    id: m.id,
    albumId: m.albumId,
    type: m.type,
    url: m.url,
    caption: m.caption ?? '',
    createdAt: m.createdAt,
  };
}

export const useGetAlbums = () =>
  useQuery({
    queryKey: [API, 'albums'],
    queryFn: async () => {
      const res = await apiClient
        .get<ApiResponse<{ items: BackendAlbum[] }>>(`${API}/albums`, { params: { limit: 500 } })
        .then(unwrapApi);
      return (res?.items ?? []).map(toAlbumRecord).sort((a, b) => b.date.localeCompare(a.date));
    },
  });

export const useGetAlbumById = ({ albumId }: { albumId?: string }) =>
  useQuery({
    queryKey: [API, 'albums', albumId],
    queryFn: async () => {
      if (!albumId) return null;
      const a = await apiClient.get<ApiResponse<BackendAlbum>>(`${API}/albums/${albumId}`).then(unwrapApi);
      return a ? toAlbumRecord(a) : null;
    },
    enabled: !!albumId,
  });

export const useGetMediaByAlbum = ({ albumId }: { albumId?: string }) =>
  useQuery({
    queryKey: [API, 'media', albumId],
    queryFn: async () => {
      if (!albumId) return [];
      const res = await apiClient
        .get<ApiResponse<BackendMedia[]>>(`${API}/albums/${albumId}/photos`)
        .then(unwrapApi);
      return (res ?? []).map(toMediaItem);
    },
    enabled: !!albumId,
  });

export const useCreateAlbum = () =>
  useAppMutation<
    AlbumRecord,
    Omit<AlbumRecord, 'id' | 'coverUrl' | 'createdAt' | 'updatedAt'> & { coverUrl?: string }
  >({
    mutationFn: async (body) => {
      const created = await apiClient
        .post<ApiResponse<BackendAlbum>>(`${API}/albums`, {
          title: body.title,
          description: body.description || undefined,
          date: body.date,
          visibility: body.visibility,
          coverUrl: body.coverUrl || undefined,
        })
        .then(unwrapApi);
      return toAlbumRecord(created);
    },
    successMsg: 'Album created successfully',
    errorMsg: 'Failed to create album',
    invalidateQueryKeys: [[API, 'albums']],
  });

export const useUpdateAlbum = () =>
  useAppMutation<
    AlbumRecord,
    { id: string } & Partial<Omit<AlbumRecord, 'id' | 'createdAt'>>
  >({
    mutationFn: async (body) => {
      const updated = await apiClient
        .put<ApiResponse<BackendAlbum>>(`${API}/albums/${body.id}`, {
          title: body.title,
          description: body.description || undefined,
          date: body.date,
          visibility: body.visibility,
          coverUrl: body.coverUrl || undefined,
        })
        .then(unwrapApi);
      return toAlbumRecord(updated);
    },
    successMsg: 'Album updated successfully',
    errorMsg: 'Failed to update album',
    invalidateQueryKeys: [[API, 'albums']],
  });

export const useDeleteAlbum = () =>
  useAppMutation<{ id: string }, { id: string }>({
    mutationFn: async (body) => {
      await apiClient.delete(`${API}/albums/${body.id}`);
      return { id: body.id };
    },
    successMsg: 'Album deleted successfully',
    errorMsg: 'Failed to delete album',
    invalidateQueryKeys: [[API, 'albums']],
  });

export const useAddMediaToAlbum = () =>
  useAppMutation<
    MediaItem,
    { albumId: string; type: MediaType; url: string; caption?: string | null }
  >({
    mutationFn: async (body) => {
      const created = await apiClient
        .post<ApiResponse<BackendMedia>>(`${API}/albums/${body.albumId}/photos`, {
          type: body.type,
          url: body.url,
          caption: body.caption ?? '',
        })
        .then(unwrapApi);
      return toMediaItem(created);
    },
    successMsg: 'Media uploaded successfully',
    errorMsg: 'Failed to upload media',
    invalidateQueryKeys: [[API, 'media'], [API, 'albums']],
  });

import { useQuery } from '@tanstack/react-query';
import { useAppMutation } from '@/reactQueryConfig/hooks/useAppMutation';
import { mockDelay } from '@/shared/utils';

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
let albumStore: AlbumRecord[] = [];
let mediaStore: MediaItem[] = [];

function seedImages() {
  // lightweight placeholders using gradients via data URLs would be heavy; use simple https placeholder paths as strings
  return [
    'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1519455953755-af066f52f1ea?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=60',
  ];
}

function ensureSeed() {
  if (albumStore.length) return;
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0];
  const imgs = seedImages();

  albumStore = [
    {
      id: 'ALB-1',
      title: 'Annual Day 2026',
      description: 'Highlights from the annual day performances.',
      date: yesterday,
      visibility: 'public',
      coverUrl: imgs[0],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ALB-2',
      title: 'Science Fair',
      description: 'Projects and exhibits by students.',
      date: today,
      visibility: 'parents',
      coverUrl: imgs[2],
      createdAt: now,
      updatedAt: now,
    },
  ];

  mediaStore = [
    { id: 'MED-1', albumId: 'ALB-1', type: 'image', url: imgs[0], caption: 'Stage performance', createdAt: now },
    { id: 'MED-2', albumId: 'ALB-1', type: 'image', url: imgs[1], caption: 'Audience moments', createdAt: now },
    { id: 'MED-3', albumId: 'ALB-1', type: 'image', url: imgs[3], caption: 'Group photo', createdAt: now },
    { id: 'MED-4', albumId: 'ALB-2', type: 'image', url: imgs[2], caption: 'Exhibit hall', createdAt: now },
    { id: 'MED-5', albumId: 'ALB-2', type: 'image', url: imgs[4], caption: 'Student project', createdAt: now },
    { id: 'MED-6', albumId: 'ALB-2', type: 'image', url: imgs[5], caption: 'Awards', createdAt: now },
  ];
}

export const useGetAlbums = () =>
  useQuery({
    queryKey: [API, 'albums'],
    queryFn: async () => {
      await mockDelay(150);
      ensureSeed();
      return [...albumStore].sort((a, b) => b.date.localeCompare(a.date));
    },
  });

export const useGetAlbumById = ({ albumId }: { albumId?: string }) =>
  useQuery({
    queryKey: [API, 'albums', albumId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return albumStore.find((a) => a.id === albumId) ?? null;
    },
    enabled: !!albumId,
  });

export const useGetMediaByAlbum = ({ albumId }: { albumId?: string }) =>
  useQuery({
    queryKey: [API, 'media', albumId],
    queryFn: async () => {
      await mockDelay(120);
      ensureSeed();
      return mediaStore.filter((m) => m.albumId === albumId);
    },
    enabled: !!albumId,
  });

export const useCreateAlbum = () =>
  useAppMutation({
    mutationFn: async (body: Omit<AlbumRecord, 'id' | 'coverUrl' | 'createdAt' | 'updatedAt'> & { coverUrl?: string }) => {
      await mockDelay(200);
      ensureSeed();
      const now = new Date().toISOString();
      const created: AlbumRecord = {
        id: `ALB-${albumStore.length + 1}`,
        coverUrl: body.coverUrl ?? seedImages()[0],
        createdAt: now,
        updatedAt: now,
        ...body,
      };
      albumStore = [created, ...albumStore];
      return created;
    },
    successMsg: 'Album created successfully',
    errorMsg: 'Failed to create album',
    invalidateQueryKeys: [[API, 'albums']],
  });

export const useUpdateAlbum = () =>
  useAppMutation({
    mutationFn: async (body: { id: string } & Partial<Omit<AlbumRecord, 'id' | 'createdAt'>>) => {
      await mockDelay(200);
      ensureSeed();
      const current = albumStore.find((a) => a.id === body.id);
      if (!current) throw new Error('Album not found');
      const next: AlbumRecord = { ...current, ...body, updatedAt: new Date().toISOString() };
      albumStore = albumStore.map((a) => (a.id === body.id ? next : a));
      return next;
    },
    successMsg: 'Album updated successfully',
    errorMsg: 'Failed to update album',
    invalidateQueryKeys: [[API, 'albums']],
  });

export const useDeleteAlbum = () =>
  useAppMutation({
    mutationFn: async (body: { id: string }) => {
      await mockDelay(160);
      ensureSeed();
      albumStore = albumStore.filter((a) => a.id !== body.id);
      mediaStore = mediaStore.filter((m) => m.albumId !== body.id);
      return { id: body.id };
    },
    successMsg: 'Album deleted successfully',
    errorMsg: 'Failed to delete album',
    invalidateQueryKeys: [[API, 'albums']],
  });

export const useAddMediaToAlbum = () =>
  useAppMutation({
    mutationFn: async (body: { albumId: string; type: MediaType; url: string; caption?: string | null }) => {
      await mockDelay(200);
      ensureSeed();
      const album = albumStore.find((a) => a.id === body.albumId);
      if (!album) throw new Error('Album not found');
      const created: MediaItem = {
        id: `MED-${mediaStore.length + 1}`,
        albumId: body.albumId,
        type: body.type,
        url: body.url,
        caption: body.caption ?? '',
        createdAt: new Date().toISOString(),
      };
      mediaStore = [created, ...mediaStore];
      // bump album updatedAt and cover
      albumStore = albumStore.map((a) =>
        a.id === body.albumId ? { ...a, coverUrl: a.coverUrl || body.url, updatedAt: new Date().toISOString() } : a
      );
      return created;
    },
    successMsg: 'Media uploaded successfully',
    errorMsg: 'Failed to upload media',
    invalidateQueryKeys: [[API, 'media'], [API, 'albums']],
  });


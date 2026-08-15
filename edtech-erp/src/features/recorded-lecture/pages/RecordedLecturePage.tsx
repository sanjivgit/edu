import { useState } from 'react';
import { ExternalLink, PlayCircle, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmModal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import type { TableColumn } from '@/types';
import { useToast } from '@/hooks';
import {
  getAssetUrl,
  useDeleteRecordedLecture,
  useGetRecordedLectures,
  type RecordedLectureRecord,
} from '../services/recordedLecture.service';

function formatClassDisplay(record: RecordedLectureRecord): string {
  if (!record.classDisplay && !record.section) return 'All';
  return `Class ${record.classDisplay}${record.section ? `-${record.section}` : ''}`.trim();
}

export default function RecordedLecturePage() {
  const { warning } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<RecordedLectureRecord | null>(null);

  const lecturesQuery = useGetRecordedLectures();
  const deleteMutation = useDeleteRecordedLecture();

  const lectures = lecturesQuery.data ?? [];

  const handleOpen = (row: RecordedLectureRecord) => {
    const target = row.meetingUrl || row.attachments?.[0]?.url;
    const url = getAssetUrl(target);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    else warning('No media', 'This lecture does not have a playback link yet.');
  };

  const columns: TableColumn<RecordedLectureRecord>[] = [
    {
      key: 'title',
      header: 'Lecture',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-xs text-muted-foreground">{row.subject}</p>
        </div>
      ),
    },
    { key: 'classDisplay', header: 'Class', render: (_, row) => <span>{formatClassDisplay(row)}</span> },
    { key: 'durationMinutes', header: 'Duration', render: (_, row) => (row.durationMinutes ? `${row.durationMinutes} min` : '—') },
    { key: 'hostName', header: 'Host' },
    { key: 'createdAt', header: 'Uploaded', sortable: true, render: (_, row) => new Date(row.createdAt).toLocaleDateString('en-IN') },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recorded Lectures"
        description="Browse recorded learning content"
      />

      <DataTable
        columns={columns}
        data={lectures}
        total={lectures.length}
        isLoading={lecturesQuery.isLoading}
        searchPlaceholder="Search recorded lectures..."
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              title="Play lecture"
              onClick={(event) => {
                event.stopPropagation();
                handleOpen(row);
              }}
            >
              <PlayCircle className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-destructive"
              title="Delete"
              onClick={(event) => {
                event.stopPropagation();
                setConfirmDelete(row);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          deleteMutation.mutate(
            { id: confirmDelete.id },
            { onSuccess: () => setConfirmDelete(null) }
          );
        }}
        title="Delete Lecture"
        description={`Are you sure you want to delete "${confirmDelete?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ExternalLink className="h-4 w-4" />
        Recorded lectures are added by teachers and made available to students.
      </div>
    </div>
  );
}

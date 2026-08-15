import { useState } from 'react';
import { CalendarClock, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmModal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import type { TableColumn } from '@/types';
import { useToast } from '@/hooks';
import { useGetClasses } from '@/features/classes/services/classes.service';
import { LiveLectureFormModal } from '../components/LiveLectureFormModal';
import {
  formatClassDisplay,
  useCreateLiveLecture,
  useDeleteLiveLecture,
  useGetLiveLectures,
  useJoinLecture,
  useUpdateLiveLecture,
  type LectureInput,
  type LiveLectureRecord,
} from '../services/liveLecture.service';

export default function LiveLecturePage() {
  const { warning } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LiveLectureRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LiveLectureRecord | null>(null);

  const lecturesQuery = useGetLiveLectures();
  const classesQuery = useGetClasses();
  const createMutation = useCreateLiveLecture();
  const updateMutation = useUpdateLiveLecture();
  const deleteMutation = useDeleteLiveLecture();
  const joinMutation = useJoinLecture();

  const lectures = lecturesQuery.data ?? [];
  const classOptions = (classesQuery.data ?? []).map((c) => ({ label: c.name, value: c.name }));

  const handleSubmit = (payload: LectureInput) => {
    if (!payload.title.trim() || !payload.date || !payload.time) {
      warning('Missing fields', 'Title, date and time are required.');
      return;
    }
    const onSuccess = () => {
      setModalOpen(false);
      setEditing(null);
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...payload }, { onSuccess });
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  };

  const handleJoin = (row: LiveLectureRecord) => {
    joinMutation.mutate(
      { id: row.id },
      {
        onSuccess: (res) => {
          if (res.joinUrl) window.open(res.joinUrl, '_blank', 'noopener,noreferrer');
          else warning('No meeting URL', 'This session does not have a meeting link yet.');
        },
      }
    );
  };

  const columns: TableColumn<LiveLectureRecord>[] = [
    {
      key: 'title',
      header: 'Live Class',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-xs text-muted-foreground">{row.subject}</p>
        </div>
      ),
    },
    { key: 'classDisplay', header: 'Class', render: (_, row) => <span>{formatClassDisplay(row)}</span> },
    {
      key: 'scheduledAt',
      header: 'Schedule',
      sortable: true,
      render: (_, row) => (
        <span className="text-sm">
          {row.scheduledAt ? `${row.scheduledAt} ${row.time}` : '—'}
        </span>
      ),
    },
    { key: 'durationMinutes', header: 'Duration', render: (_, row) => (row.durationMinutes ? `${row.durationMinutes} min` : '—') },
    { key: 'hostName', header: 'Host' },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={row.status} /> },
  ];

  const upcoming = lectures.filter((l) => l.status === 'scheduled').length;
  const liveNow = lectures.filter((l) => l.status === 'live').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Classes"
        description="Join and host live learning sessions"
        actions={
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Schedule Live Class
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-muted-foreground">Total Sessions</p>
          <p className="text-3xl font-display font-bold mt-1 text-blue-600">{lectures.length}</p>
        </Card>
        <Card className="border-0 bg-emerald-50 dark:bg-emerald-900/20">
          <p className="text-sm text-muted-foreground">Upcoming</p>
          <p className="text-3xl font-display font-bold mt-1 text-emerald-600">{upcoming}</p>
        </Card>
        <Card className="border-0 bg-violet-50 dark:bg-violet-900/20">
          <p className="text-sm text-muted-foreground">Live Now</p>
          <p className="text-3xl font-display font-bold mt-1 text-violet-600">{liveNow}</p>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={lectures}
        total={lectures.length}
        isLoading={lecturesQuery.isLoading}
        searchPlaceholder="Search live classes..."
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            {(row.status === 'scheduled' || row.status === 'live') && (
              <Button
                size="icon-sm"
                variant="ghost"
                title="Join session"
                onClick={(event) => {
                  event.stopPropagation();
                  handleJoin(row);
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon-sm"
              variant="ghost"
              title="Edit"
              onClick={(event) => {
                event.stopPropagation();
                setEditing(row);
                setModalOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
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

      <LiveLectureFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={(editing ? updateMutation : createMutation).isPending}
        initial={editing}
        classOptions={classOptions}
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
        title="Delete Live Class"
        description={`Are you sure you want to delete "${confirmDelete?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarClock className="h-4 w-4" />
        Sessions are visible to students according to their class and section.
      </div>
    </div>
  );
}

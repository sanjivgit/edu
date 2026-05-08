import { useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmModal, Modal } from '@/components/ui/Modal';
import { Input, SelectInput } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import type { TableColumn } from '@/types';
import { useToast } from '@/hooks';
import {
  useCreateModuleRecord,
  useDeleteModuleRecord,
  useModuleRecordById,
  useModuleRecords,
  useUpdateModuleRecord,
} from '../hooks/useModuleCrud';
import type { ModuleRecord } from '../services/mockModuleService';

interface ModuleCrudPageProps {
  moduleKey: string;
  title: string;
  description: string;
  entityLabel: string;
}

export function ModuleCrudPage({ moduleKey, title, description, entityLabel }: ModuleCrudPageProps) {
  const { warning } = useToast();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');

  const recordsQuery = useModuleRecords(moduleKey, title);
  const recordQuery = useModuleRecordById(moduleKey, title, selectedId);
  const createMutation = useCreateModuleRecord(moduleKey, title, entityLabel);
  const updateMutation = useUpdateModuleRecord(moduleKey, title, entityLabel);
  const deleteMutation = useDeleteModuleRecord(moduleKey, title, entityLabel);
  const records = recordsQuery.data ?? [];

  const columns: TableColumn<ModuleRecord>[] = [
    { key: 'id', header: `${entityLabel} ID`, render: (_, row) => <span className="font-mono text-xs font-medium text-primary">{row.id}</span> },
    { key: 'name', header: entityLabel, sortable: true, render: (_, row) => <span className="font-medium">{row.name}</span> },
    { key: 'createdAt', header: 'Created On', sortable: true, render: (_, row) => new Date(row.createdAt).toLocaleDateString('en-IN') },
    { key: 'updatedAt', header: 'Updated On', sortable: true, render: (_, row) => new Date(row.updatedAt).toLocaleDateString('en-IN') },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={row.status} /> },
  ];

  const activeCount = records.filter((item) => item.status === 'active').length;

  const handleCreate = () => {
    if (!name.trim()) {
      warning('Missing field', `Please enter ${entityLabel.toLowerCase()} name.`);
      return;
    }

    createMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName('');
          setCreateModalOpen(false);
        },
      }
    );
  };

  const openViewModal = (id: string) => {
    setSelectedId(id);
    setViewModalOpen(true);
  };

  const openEditModal = (row: ModuleRecord) => {
    setSelectedId(row.id);
    setEditName(row.name);
    setEditStatus(row.status);
    setEditModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setSelectedId(id);
    setConfirmDeleteOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedId || !editName.trim()) {
      warning('Missing fields', `Please enter ${entityLabel.toLowerCase()} name.`);
      return;
    }

    updateMutation.mutate(
      { id: selectedId, name: editName.trim(), status: editStatus },
      {
        onSuccess: () => {
          setEditModalOpen(false);
          setSelectedId(null);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!selectedId) return;
    deleteMutation.mutate(
      { id: selectedId },
      {
        onSuccess: () => {
          setConfirmDeleteOpen(false);
          setSelectedId(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateModalOpen(true)}>
            Add New
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-muted-foreground">Total Records</p>
          <p className="text-3xl font-display font-bold mt-1 text-blue-600">{records.length}</p>
        </Card>
        <Card className="border-0 bg-emerald-50 dark:bg-emerald-900/20">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-3xl font-display font-bold mt-1 text-emerald-600">{activeCount}</p>
        </Card>
        <Card className="border-0 bg-violet-50 dark:bg-violet-900/20">
          <p className="text-sm text-muted-foreground">Last Updated</p>
          <p className="text-sm font-medium mt-2 text-violet-700 dark:text-violet-300">
            {records[records.length - 1]
              ? new Date(records[records.length - 1].createdAt).toLocaleDateString('en-IN')
              : 'N/A'}
          </p>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={records}
        total={records.length}
        isLoading={recordsQuery.isLoading}
        searchPlaceholder={`Search ${entityLabel.toLowerCase()}...`}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              title={`View ${entityLabel}`}
              onClick={(event) => {
                event.stopPropagation();
                openViewModal(row.id);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              title={`Edit ${entityLabel}`}
              onClick={(event) => {
                event.stopPropagation();
                openEditModal(row);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-destructive"
              title={`Delete ${entityLabel}`}
              onClick={(event) => {
                event.stopPropagation();
                openDeleteModal(row.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={`Add ${entityLabel}`}
        description={`Create a new ${entityLabel.toLowerCase()} entry for ${title}.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} isLoading={createMutation.isPending}>
              Save
            </Button>
          </>
        }
      >
        <Input
          label={`${entityLabel} Name`}
          placeholder={`Enter ${entityLabel.toLowerCase()} name`}
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Modal>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Update ${entityLabel}`}
        description={`Edit ${entityLabel.toLowerCase()} details.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} isLoading={updateMutation.isPending}>
              Update
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={`${entityLabel} Name`}
            placeholder={`Enter ${entityLabel.toLowerCase()} name`}
            required
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
          />
          <SelectInput
            label="Status"
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            value={editStatus}
            onChange={(event) => setEditStatus(event.target.value as 'active' | 'inactive')}
          />
        </div>
      </Modal>

      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`${entityLabel} Details`}
        footer={
          <Button variant="outline" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">ID</p>
            <p className="font-mono">{recordQuery.data?.id ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="font-medium">{recordQuery.data?.name ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            {recordQuery.data ? <StatusBadge status={recordQuery.data.status} /> : <p>N/A</p>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p>{recordQuery.data?.createdAt ? new Date(recordQuery.data.createdAt).toLocaleString('en-IN') : 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Updated</p>
            <p>{recordQuery.data?.updatedAt ? new Date(recordQuery.data.updatedAt).toLocaleString('en-IN') : 'N/A'}</p>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${entityLabel}`}
        description={`Are you sure you want to delete this ${entityLabel.toLowerCase()}?`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

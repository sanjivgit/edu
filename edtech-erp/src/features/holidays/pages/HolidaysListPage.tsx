import { CalendarDays, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';
import { HolidaysCalendar } from '../components/HolidaysCalendar';
import { HolidaysTable } from '../components/HolidaysTable';
import { useDeleteHoliday, useGetHolidays } from '../services/holidays.service';

export default function HolidaysListPage() {
  const navigate = useNavigate();
  const { isManagement } = useAuth();
  const [view, setView] = useState<'calendar' | 'table'>('calendar');
  const listQuery = useGetHolidays();
  const deleteMutation = useDeleteHoliday();
  const data = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Holidays"
        description={isManagement ? 'Manage yearly holiday calendar and school events' : 'View the school holiday calendar'}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant={view === 'calendar' ? 'default' : 'outline'} leftIcon={<CalendarDays className="h-4 w-4" />} onClick={() => setView('calendar')}>
              Calendar
            </Button>
            <Button size="sm" variant={view === 'table' ? 'default' : 'outline'} onClick={() => setView('table')}>
              Table
            </Button>
            {isManagement ? <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/holidays/create')}>Add Holiday</Button> : null}
          </div>
        }
      />

      {view === 'calendar' ? (
        <HolidaysCalendar data={data} />
      ) : (
        <HolidaysTable
          data={data}
          isLoading={listQuery.isLoading}
          onView={(row) => navigate(`/holidays/${row.id}`)}
          onEdit={isManagement ? (row) => navigate(`/holidays/${row.id}/edit`) : undefined}
          onDelete={isManagement ? (row) => deleteMutation.mutate({ id: row.id }) : undefined}
        />
      )}
    </div>
  );
}


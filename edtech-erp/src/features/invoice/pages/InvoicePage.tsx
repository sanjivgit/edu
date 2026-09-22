import { Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/components/shared/Guards';
import { ACCESS } from '@/config/access';
import InvoiceListPage from './InvoiceListPage';
import InvoiceCreatePage from './InvoiceCreatePage';
import InvoiceDetailPage from './InvoiceDetailPage';
import InvoiceEditPage from './InvoiceEditPage';

export default function InvoicePage() {
  return (
    <Routes>
      <Route index element={<InvoiceListPage />} />
      <Route path="create" element={<RequireRole roles={[...ACCESS.manageInvoices]}><InvoiceCreatePage /></RequireRole>} />
      <Route path=":invoiceId" element={<InvoiceDetailPage />} />
      <Route path=":invoiceId/edit" element={<RequireRole roles={[...ACCESS.manageInvoices]}><InvoiceEditPage /></RequireRole>} />
    </Routes>
  );
}

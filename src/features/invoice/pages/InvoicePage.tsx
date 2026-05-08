import { Route, Routes } from 'react-router-dom';
import InvoiceListPage from './InvoiceListPage';
import InvoiceCreatePage from './InvoiceCreatePage';
import InvoiceDetailPage from './InvoiceDetailPage';
import InvoiceEditPage from './InvoiceEditPage';

export default function InvoicePage() {
  return (
    <Routes>
      <Route index element={<InvoiceListPage />} />
      <Route path="create" element={<InvoiceCreatePage />} />
      <Route path=":invoiceId" element={<InvoiceDetailPage />} />
      <Route path=":invoiceId/edit" element={<InvoiceEditPage />} />
    </Routes>
  );
}

import { useState } from 'react';
import { useAdminQuery } from '../../api/admin.api';
import { AdminDataState } from '../../components/AdminDataState';
import { topcodesSchema } from '../model/scoring.schema';
import { ContentEditor } from '../components/ContentEditor';
import '../../components/admin-pages.css';
export function HollandContentPage() {
  const query = useAdminQuery(['topcodes'], '/api/v1/admin/topcodes', topcodesSchema),
    [code, setCode] = useState('R');
  return (
    <div className="admin-page">
      <h1>Nội dung Holland</h1>
      <AdminDataState query={query}>
        {(data) => (
          <>
            <label>
              Chọn nhóm Holland
              <select value={code} onChange={(e) => setCode(e.target.value)}>
                {data.map((row) => (
                  <option key={row.code}>{row.code}</option>
                ))}
              </select>
            </label>
            {data.find((row) => row.code === code) ? (
              <ContentEditor
                key={code}
                record={data.find((row) => row.code === code)!}
                reload={async () => !(await query.refetch()).isError}
              />
            ) : (
              <p>Chưa có nội dung cho nhóm này.</p>
            )}
          </>
        )}
      </AdminDataState>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Dialog } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { Icon } from '@/shared/ui/Icon';
import { paths } from '@/routes/paths';

export function ShellPreview() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const admin = useLocation().pathname === paths.previewAdmin;
  return <div className="shell-preview">
    <header className="preview-heading"><Badge>Bản xem trước giao diện</Badge><h1>{admin ? 'Không gian quản trị' : 'AIHN Career'}</h1>
      <p>Xem thử giao diện. Chưa có dữ liệu cá nhân ở đây.</p>
    </header>
    <Card className="preview-welcome"><span className="preview-emblem"><Icon name={admin ? 'library' : 'compass'} /></span>
      <div><h2>{admin ? 'Công cụ quản trị' : 'Chọn bước tiếp theo'}</h2><p>{admin ? 'Công cụ quản lý đang được chuẩn bị.' : 'Nhìn lại sở thích và tìm hiểu những nghề đáng thử.'}</p></div>
      <Badge>Chưa sẵn sàng</Badge>
    </Card>
    <div className="preview-grid">
      <Card><div className="card-heading"><span className="preview-emblem small"><Icon name="user" /></span><h2>Thông tin cơ bản</h2></div>
        <Field label="Tên hiển thị" placeholder="Nhập tên của bạn" hint="Thông tin nhập thử không được lưu." autoComplete="off" />
        <Field label="Email" type="email" placeholder="ban@example.com" autoComplete="off" />
        <div className="preview-actions"><Button onClick={() => setDialogOpen(true)}>Mở hộp thoại</Button><Button variant="secondary" disabled>Lưu thông tin</Button></div>
      </Card>
      <Card><div className="card-heading"><span className="preview-emblem small warm"><Icon name="roadmap" /></span><h2>Xem thử AIHN</h2></div>
        <p>Xem thử giao diện sinh viên, quản trị và tài khoản.</p>
        <div className="preview-links">
          <Link to={paths.previewStudent}>Xem giao diện sinh viên <span aria-hidden="true">→</span></Link>
          <Link to={paths.previewAdmin}>Xem giao diện quản trị <span aria-hidden="true">→</span></Link>
          <Link to={paths.previewAuth}>Xem giao diện tài khoản <span aria-hidden="true">→</span></Link>
        </div>
      </Card>
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="Thông báo" className={admin ? 'admin-theme' : ''}>
      <p>Đây là giao diện mẫu. Thông tin nhập thử không được lưu.</p>
      <Button variant="secondary" onClick={() => setDialogOpen(false)}>Đã hiểu</Button>
    </Dialog>
  </div>;
}

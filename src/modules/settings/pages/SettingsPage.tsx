import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { useProfileQuery } from '@/modules/profile';
import { choices, defaultAppearance, setAppearance, useAppearance } from '@/shared/appearance/appearance';
import './settings.css';
export function SettingsPage() {
  const appearance = useAppearance(),
    profile = useProfileQuery();
  const fields = {
    preset: 'Giao diện',
    accent: 'Điểm nhấn',
    background: 'Kiểu nền',
    sidebar: 'Thanh điều hướng',
  } as const;
  const labels: Record<string, string> = {
    blue: 'Xanh dương',
    teal: 'Xanh ngọc',
    warm: 'Ấm áp',
    dark: 'Tối',
    ocean: 'Đại dương',
    indigo: 'Chàm',
    violet: 'Tím',
    rose: 'Hồng',
    gradient: 'Chuyển màu nhẹ',
    flat: 'Màu phẳng',
    light: 'Sáng',
    tinted: 'Phủ màu nhẹ',
    contrast: 'Tương phản',
  };
  return (
    <div className="settings-page">
      <header>
        <h1>Cài đặt tài khoản</h1>
        <p>Quản lý thông tin và tùy chỉnh không gian học tập.</p>
      </header>
      <section>
        <h2>Thông tin tài khoản</h2>
        {profile.isError ? (
          <p role="alert">
            Không tải được tài khoản.{' '}
            <button className="btn btn-secondary" onClick={() => void profile.refetch()}>
              Thử lại
            </button>
          </p>
        ) : profile.isPending ? (
          <p role="status">Đang tải tài khoản…</p>
        ) : (
          <>
            <label>
              Họ và tên
              <input value={profile.data.fullname} readOnly />
            </label>
            <label>
              Email
              <input type="email" value={profile.data.email} readOnly />
            </label>
            <Link className="btn btn-secondary" to={paths.careerProfile}>
              Chỉnh sửa hồ sơ
            </Link>
          </>
        )}
        <p>Đăng xuất bằng nút tài khoản trên trang để kết thúc phiên hiện tại.</p>
      </section>
      <section>
        <h2>Giao diện &amp; Cá nhân hóa</h2>
        <p>
          Lưu trên thiết bị này, áp dụng cho các tài khoản sử dụng cùng trình duyệt. Không đồng bộ lên máy
          chủ.
        </p>
        <div className="settings-grid">
          {Object.entries(fields).map(([key, label]) => (
            <label key={key}>
              {label}
              <select
                value={appearance.value[key as keyof typeof fields]}
                onChange={(event) => setAppearance({ ...appearance.value, [key]: event.target.value })}
              >
                {choices[key as keyof typeof fields].map((value) => (
                  <option key={value} value={value}>
                    {labels[value]}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={() => setAppearance(defaultAppearance)}>
          Khôi phục mặc định
        </button>
        <p role="status">
          {appearance.persisted
            ? 'Lựa chọn được áp dụng trên thiết bị này.'
            : 'Đã áp dụng tạm thời; trình duyệt không cho lưu. Tải lại có thể mất lựa chọn.'}
        </p>
      </section>
      <section>
        <h2>Bảo mật &amp; Dữ liệu</h2>
        <p>Đổi mật khẩu, thông báo, xuất PDF và xóa tài khoản chưa được hỗ trợ tại đây.</p>
      </section>
    </div>
  );
}

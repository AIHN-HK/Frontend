import { Link } from 'react-router';
import { Button, Input } from 'antd';
import { usePageEntrance } from '@/shared/ui/ce/usePageEntrance';
import { paths } from '@/routes/paths';
import { useProfileQuery } from '@/modules/profile';
import { appearanceCustomizationEnabled, choices, defaultAppearance, setAppearance, useAppearance } from '@/shared/appearance/appearance';
import './settings.css';
import styles from './SettingsPage.module.css';
export function SettingsPage() {
  const appearance = useAppearance(),
    profile = useProfileQuery();
  const root = usePageEntrance(profile.data ? profile.data.email : 'loading');
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
    <div ref={root} className={`${styles.page} settings-page`}>
      <header>
        <h1>Cài đặt tài khoản</h1>
        <p>Thông tin và cài đặt tài khoản của bạn.</p>
      </header>
      <section data-ce-enter="">
        <h2>Thông tin tài khoản</h2>
        {profile.isError ? (
          <p role="alert">
            Không tải được tài khoản.{' '}
            <Button className="btn btn-secondary" onClick={() => void profile.refetch()}>
              Thử lại
            </Button>
          </p>
        ) : profile.isPending ? (
          <p role="status">Đang tải tài khoản…</p>
        ) : (
          <>
            <label>
              Họ và tên
              <Input value={profile.data.fullname} readOnly />
            </label>
            <label>
              Email
              <Input type="email" value={profile.data.email} readOnly />
            </label>
            <Link className="btn btn-secondary" to={paths.careerProfile}>
              Chỉnh sửa hồ sơ
            </Link>
          </>
        )}
        <p>Dùng nút tài khoản trên trang để đăng xuất.</p>
      </section>
      {appearanceCustomizationEnabled && <section data-ce-enter="">
        <h2>Tùy chỉnh giao diện</h2>
        <p>
          AIHN hiện dùng giao diện tối. Các lựa chọn này chỉ đổi giao diện xem trước trên thiết bị này.
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
        <Button className="btn btn-secondary" onClick={() => setAppearance(defaultAppearance)}>
          Khôi phục mặc định
        </Button>
        <p role="status">
          {appearance.persisted
            ? 'Đã lưu lựa chọn cho giao diện xem trước trên thiết bị này.'
            : 'Đã áp dụng tạm cho giao diện xem trước. Trình duyệt chưa cho lưu, tải lại có thể mất lựa chọn.'}
        </p>
      </section>}
      <section data-ce-enter="">
        <h2>Bảo mật và dữ liệu</h2>
        <p>Chưa hỗ trợ đổi mật khẩu, cài thông báo, xuất PDF hay xóa tài khoản ở đây.</p>
      </section>
    </div>
  );
}

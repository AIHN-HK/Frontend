import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { registrationDraft } from '../../model/registration-draft';
import './signup.css';

// T03 boundary only. OTP verification/resend/account creation belong to T04.
export function RegistrationHandoff() {
  const draft = registrationDraft.read();
  return <div className="registration-handoff">
    <h1>Xác thực OTP chưa sẵn sàng</h1>
    <p role="status">{draft?.otpRequested ? 'Máy chủ đã xác nhận yêu cầu gửi OTP. Tài khoản chưa được tạo.' : draft ? 'Chưa xác nhận yêu cầu gửi OTP. Thông tin đăng ký vẫn được giữ trong tab này; tài khoản chưa được tạo.' : 'Không có thông tin đăng ký trong tab này. Vui lòng trở lại đăng ký.'}</p>
    <p>Màn nhập mã xác thực đang được chuẩn bị. Bạn có thể trở lại đăng ký để xem thông tin đã nhập.</p>
    <Link className="btn btn-secondary" to={paths.signup}>Trở lại đăng ký</Link>
    <Link className="signup-handoff-home" to={paths.home}>← Về trang chủ</Link>
  </div>;
}

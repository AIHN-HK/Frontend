export function Brand({ admin = false }: { admin?: boolean }) {
  return <span className="brand">
    <span className="brand-badge">AI</span>
    <span className="brand-info"><strong>AIHN {admin ? 'Admin' : 'Career'}</strong><small>{admin ? 'Không gian quản trị' : 'Hệ thống Cố vấn Nghề nghiệp'}</small></span>
  </span>;
}

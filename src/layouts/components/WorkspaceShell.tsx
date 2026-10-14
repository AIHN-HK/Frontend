import { useEffect, useState } from 'react';
import { useAppearance, appearanceClass } from '@/shared/appearance/appearance';
import '@/shared/appearance/appearance.css';
import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Brand } from '@/shared/ui/Brand';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Drawer } from '@/shared/ui/Drawer';
import { Icon } from '@/shared/ui/Icon';
import { paths } from '@/routes/paths';
import type { NavigationItem } from '../navigation';

function Navigation({ items, onNavigate }: { items: NavigationItem[]; onNavigate?: () => void }) {
  const groups = [...new Set(items.map(item => item.group))];
  return <nav className="sidebar-nav" aria-label="Điều hướng">
    {groups.map(group => <div className="nav-group" key={group}>
      <p className="nav-section-title">{group}</p>
      {items.filter(item => item.group === group).map(item => <NavLink key={item.path} to={item.path} end={item.path === paths.admin}
        title={item.label} aria-label={item.label} onClick={onNavigate} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <Icon name={item.icon} /><span className="nav-label">{item.label}</span>
      </NavLink>)}
    </div>)}
  </nav>;
}

export function WorkspaceShell({ admin = false, items, children }: { admin?: boolean; items: NavigationItem[]; children: ReactNode }) {
  const appearance = useAppearance();
  const theme = admin ? 'admin-theme' : appearanceClass(appearance.value);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const preview = location.pathname.startsWith('/preview/');
  useEffect(() => {
    const media = window.matchMedia('(min-width: 769px)');
    const close = () => { if (media.matches) setDrawerOpen(false); };
    media.addEventListener('change', close);
    return () => media.removeEventListener('change', close);
  }, []);
  return <div className={`workspace-shell ${theme}`} data-testid="workspace-shell">
    <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
    <aside className="workspace-sidebar" data-testid="workspace-sidebar">
      <Link className="sidebar-brand" to={paths.home}><Brand admin={admin} /></Link>
      <Navigation items={items} />
      <footer className="sidebar-footer"><span>AIHN Career</span><small>Định hướng tương lai của bạn</small></footer>
    </aside>
    <div className="workspace-main">
      <header className="workspace-header">
        <Link className="mobile-brand" to={paths.home}><Brand admin={admin} /></Link>
        <span className="header-title">{admin ? 'Không gian quản trị' : 'Không gian sinh viên'}</span>
        <div className="header-actions">
          {preview && <Badge>Bản xem trước</Badge>}
          <Button variant="ghost" className="menu-trigger" aria-label="Mở menu phụ" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}><Icon name="menu" /></Button>
        </div>
      </header>
      <main id="main-content" className="workspace-content" tabIndex={-1}>{children}</main>
    </div>
    {!admin && <nav className="mobile-bottom-nav" aria-label="Điều hướng chính di động">
      {items.filter(item => item.bottom).map(item => <NavLink key={item.path} to={item.path} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
        <Icon name={item.icon} /><span>{item.mobileLabel ?? item.label}</span>
      </NavLink>)}
    </nav>}
    <Drawer key={location.pathname} open={drawerOpen} onOpenChange={setDrawerOpen} title="Điều hướng" className={theme}>
      <Brand admin={admin} />
      <Navigation items={items} onNavigate={() => setDrawerOpen(false)} />
    </Drawer>
  </div>;
}

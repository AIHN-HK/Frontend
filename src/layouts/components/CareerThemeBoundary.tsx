import { useRef } from 'react';
import type { ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';
import type { ThemeConfig } from 'antd';
import '@/shared/styles/ce-base.css';

const careerTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgContainer: '#161618',
    colorBgElevated: 'rgba(255,255,255,0.06)',
    colorBorder: 'rgba(255,255,255,0.12)',
    colorText: '#d4d4d8',
    colorPrimary: '#8b5cf6',
    borderRadius: 10,
    controlHeight: 44,
    fontSize: 14,
  },
};

export function CareerThemeBoundary({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  return <div className="ce-app" ref={root}>
    <ConfigProvider theme={careerTheme} getPopupContainer={trigger =>
      trigger?.closest<HTMLElement>('.ce-app') ?? root.current ?? document.body
    }>{children}</ConfigProvider>
  </div>;
}

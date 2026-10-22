'use client';

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App as AntdApp, theme } from 'antd';

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#ea580c',
            colorInfo: '#2563eb',
            colorSuccess: '#16a34a',
            colorWarning: '#eab308',
            colorError: '#dc2626',
            borderRadius: 8,
            fontFamily: "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: 14,
            colorText: '#0f172a',
            colorTextSecondary: '#64748b',
            colorBgBase: '#ffffff',
            colorBorder: '#e2e8f0',
            colorBorderSecondary: '#f1f5f9',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
            boxShadowSecondary: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
          },
          components: {
            Button: {
              controlHeight: 40,
              borderRadius: 8,
              fontWeight: 600,
              primaryShadow: '0 2px 4px rgba(234, 88, 12, 0.2)',
            },
            Input: {
              controlHeight: 40,
              borderRadius: 8,
              activeBorderColor: '#ea580c',
              hoverBorderColor: '#f97316',
            },
            Select: {
              controlHeight: 40,
              borderRadius: 8,
            },
            Card: {
              borderRadiusLG: 12,
              headerHeight: 52,
            },
            Table: {
              borderRadius: 10,
              headerBg: '#f8fafc',
              headerColor: '#334155',
              rowHoverBg: '#f8fafc',
            },
            Modal: {
              borderRadiusLG: 14,
            },
            Tabs: {
              itemSelectedColor: '#ea580c',
              inkBarColor: '#ea580c',
              titleFontSize: 14,
            },
            Tag: {
              borderRadiusSM: 6,
            },
          },
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}

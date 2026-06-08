import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface BrandingValue {
  color: string;
  setColor: (color: string | null) => void;
  groupName: string | null;
  setGroupName: (name: string | null) => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  isThemed: boolean;
}

const DEFAULT_COLOR = '#29B6F6';

const BrandingContext = createContext<BrandingValue | null>(null);

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return { r, g, b };
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [color, setColorState] = useState<string>(DEFAULT_COLOR);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const setColor = (next: string | null) => {
    setColorState(next || DEFAULT_COLOR);
  };

  const isThemed = color !== DEFAULT_COLOR;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-color', color);
    const rgb = hexToRgb(color);
    if (rgb) {
      root.style.setProperty('--brand-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
    return () => {
      // only reset if we're the ones who set it and unmounting global provider (unlikely)
    };
  }, [color]);

  const value = useMemo(
    () => ({ color, setColor, groupName, setGroupName, logoUrl, setLogoUrl, isThemed }),
    [color, groupName, logoUrl, isThemed]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

export const useBranding = () => {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
  return ctx;
};

/**
 * Hook utilitário para telas dentro de um grupo: aplica a cor do grupo
 * enquanto montado e reseta para a cor padrão ao desmontar.
 */
export const useGroupBranding = (group?: { color?: string | null; name?: string | null; logoUrl?: string | null } | null) => {
  const { setColor, setGroupName, setLogoUrl } = useBranding();

  useEffect(() => {
    if (!group) return;
    setColor(group.color || null);
    setGroupName(group.name || null);
    setLogoUrl(group.logoUrl || null);
    return () => {
      setColor(null);
      setGroupName(null);
      setLogoUrl(null);
    };
  }, [group?.color, group?.name, group?.logoUrl, setColor, setGroupName, setLogoUrl]);
};

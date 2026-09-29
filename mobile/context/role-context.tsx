import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { Role } from '@/lib/types';
const ROLE_KEY = 'aegis.claimos.demo-role.v1';
type RoleContextValue = { role: Role; isReady: boolean; setRole: (role: Role) => Promise<void> };
const RoleContext = createContext<RoleContextValue | undefined>(undefined);
export function RoleProvider({ children }: PropsWithChildren) {
  const [role, setRoleState] = useState<Role>('FIELD_ADJUSTER'); const [isReady, setIsReady] = useState(false);
  useEffect(() => { void AsyncStorage.getItem(ROLE_KEY).then((stored) => { if (stored === 'FIELD_ADJUSTER' || stored === 'POLICYHOLDER') setRoleState(stored); setIsReady(true); }); }, []);
  const setRole = useCallback(async (nextRole: Role) => { setRoleState(nextRole); await AsyncStorage.setItem(ROLE_KEY, nextRole); }, []);
  const value = useMemo(() => ({ role, isReady, setRole }), [role, isReady, setRole]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
export function useRole(): RoleContextValue { const context = useContext(RoleContext); if (!context) throw new Error('useRole must be used inside RoleProvider.'); return context; }

import { MaterialIcons } from '@expo/vector-icons';
import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { iconMap, type IconName } from '@/lib/icons';

export function AppIcon({ icon, ...props }: Omit<React.ComponentProps<typeof MaterialIcons>, 'name'> & { icon: IconName }) { return <MaterialIcons name={iconMap[icon]} {...props} />; }
export function BrandMark({ compact = false }: { compact?: boolean }) { return <View style={styles.brandRow} accessibilityLabel="AEGIS shield check mark"><View style={styles.shield}><AppIcon icon="shieldCheck" color="#18C3CC" size={compact ? 19 : 24} /></View>{!compact ? <Text style={styles.wordmark}>AEGIS</Text> : null}</View>; }
export function ScreenContainer({ title, subtitle, right, children }: PropsWithChildren<{ title: string; subtitle?: string; right?: ReactNode }>) {
  return <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}><View style={styles.header}><View style={styles.headerCopy}><BrandMark compact /><View><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View></View>{right}</View><View style={styles.content}>{children}</View></SafeAreaView>;
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F5EF' }, content: { flex: 1 },
  header: { minHeight: 66, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#DCE3E8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCopy: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }, title: { color: '#10233D', fontSize: 18, fontWeight: '800' }, subtitle: { color: '#526273', fontSize: 12, marginTop: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, shield: { width: 31, height: 31, borderRadius: 9, backgroundColor: '#10233D', alignItems: 'center', justifyContent: 'center' }, wordmark: { color: '#10233D', fontSize: 17, fontWeight: '800', letterSpacing: 1.4 },
});

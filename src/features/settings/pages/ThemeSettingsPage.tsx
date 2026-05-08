import { Moon, Monitor, Palette, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks';
import { THEME_OPTIONS } from '@/config/modules.config';
import { cn } from '@/lib/utils';
import type { ColorMode, ThemeVariant } from '@/types';

const COLOR_MODES: { value: ColorMode; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export default function ThemeSettingsPage() {
  const { colorMode, variant, changeColorMode, changeThemeVariant } = useTheme();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Color Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {COLOR_MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => changeColorMode(m.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                  colorMode === m.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center',
                    colorMode === m.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <m.Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{m.label}</span>
                {colorMode === m.value && (
                  <Badge variant="success" dot>
                    Active
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accent Color</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => changeThemeVariant(t.value as ThemeVariant)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                  variant === t.value ? 'border-primary' : 'border-border hover:border-primary/40'
                )}
              >
                <div
                  className="h-10 w-10 rounded-full border-4 border-white dark:border-card shadow-md"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-xs font-medium flex items-center gap-1">
                  <Palette className="h-3.5 w-3.5" />
                  {t.label}
                </span>
                {variant === t.value && (
                  <Badge variant="success" dot>
                    Active
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}


import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apple } from '@react-native-ai/apple';
import { generateText } from 'ai';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/theme';

type Props = { prompt: string };

function isAppleAIAvailable(): boolean {
  try {
    return apple.isAvailable();
  } catch {
    return false;
  }
}

export function AIInsightsCard({ prompt }: Props) {
  const { t } = useTranslation();
  const [response, setResponse] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  if (!isAppleAIAvailable()) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{t('ai.title')}</Text>
        <Text style={styles.subtitle}>{t('ai.unavailable')}</Text>
      </View>
    );
  }

  async function analyse() {
    setLoading(true);
    try {
      const { text } = await generateText({
        model: apple(),
        prompt: `${t('ai.system')}\n\n${prompt}`,
      });
      setResponse(text);
    } catch {
      setResponse(t('ai.failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('ai.title')}</Text>
      <Text style={styles.subtitle}>{t('ai.subtitle')}</Text>
      {response ? <Text style={styles.body}>{response}</Text> : null}
      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <Pressable style={styles.btn} onPress={analyse}>
          <Text style={styles.btnText}>
            {response ? t('ai.analyseAgain') : t('ai.analyse')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: { color: colors.text, fontWeight: '700', fontSize: 16 },
  subtitle: { color: colors.textMuted, fontSize: 12 },
  body: { color: colors.textMuted, lineHeight: 22, fontSize: 14 },
  btn: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: { color: colors.accent, fontWeight: '700' },
});

import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Linking,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { Text, View, VStack } from "@/components/ui";
import { Colors } from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { DropDownMenu, Trigger } from "@/components/dropdown";
import { ChevronDown } from "lucide-react-native";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useI18n } from "@/contexts/I18nProvider";
import { Image } from "@/components/ui";

export default function LoginScreen() {
  const { login } = useAuth();
  const { changeLocale } = useI18n();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { colorScheme } = useSettings();

  const handleLogin = useCallback(async () => {
    if (!identifier.trim() || !password.trim()) {
      setError(t`Please fill in all fields`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(identifier, password);
      if (result.success) {
        // Login successful, user will be redirected automatically
        setIdentifier("");
        setPassword("");
      } else {
        setError(result.error || t`Login failed`);
      }
    } catch {
      setError(t`An unexpected error occurred`);
    } finally {
      setLoading(false);
    }
  }, [identifier, login, password]);

  const onOpenUrl = useCallback(() => {
    Linking.openURL("https://bsky.app");
  }, []);

  const onChangeLanguage = useCallback(
    (value: "km" | "en") => {
      changeLocale(value);
    },
    [changeLocale]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        backgroundColor: Colors.background.primary[colorScheme],
      }}
    >
      <View className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-1 justify-center"
        >
          <View className="justify-center border-gray-500 rounded-md  md:w-96 md:border md:p-4 mx-10 web:self-center">
            <VStack className="items-center mb-10">
              <Image
                source={require("../../../assets/images/icon.png")}
                style={styles.logo}
                contentFit="contain"
              />
              <Text size="xl" font="bold">
                <Trans>Welcome to Sky</Trans>
              </Text>
              <Text
                font="normal"
                style={styles.signupText}
                className="text-gray-500"
              >
                <Trans>Connect with the decentralized social web</Trans>
              </Text>
            </VStack>

            <VStack className="gap-4">
              <Input
                label={t`Username or Email`}
                placeholder={t`your.handle or email@example.com`}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                autoCorrect={false}
                className="dark:text-white dark:border-white"
              />

              <Input
                label={t`Password`}
                placeholder={t`Enter your password`}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={error}
                className="dark:text-white dark:border-white"
              />
              <Button
                title={loading ? t`Signing in...` : t`Sign In`}
                onPress={handleLogin}
                disabled={loading}
              />

              <Text size="sm" style={styles.signupText}>
                <Trans>Don&apos;t have a Bluesky account? Create one at</Trans>{" "}
                {"\n"}
                <Text
                  font="semiBold"
                  className="text-blue-500 dark:text-blue-500"
                  onPress={onOpenUrl}
                >
                  bsky.app
                </Text>
              </Text>

              <View className="self-center">
                <DropDownMenu
                  actions={[
                    {
                      label: t`English`,
                      onPress: () => onChangeLanguage("en"),
                    },
                    {
                      label: t`Khmer`,
                      onPress: () => onChangeLanguage("km"),
                    },
                  ]}
                >
                  <Trigger
                    rightIcon={ChevronDown}
                    variant="ghost"
                    rightIconColor={Colors.inverted[colorScheme]}
                    title={t`English`}
                    onPress={() => {}}
                  />
                </DropDownMenu>
              </View>
            </VStack>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 20,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 8,
  },
  signupText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});

// Centraliza flags de funcionalidades para permitir ligar/desligar sem remover código.
// Para habilitar onboarding, defina NEXT_PUBLIC_FEATURE_ONBOARDING=true no .env.local.

const toBool = (value?: string | null) =>
  (value || "").trim().toLowerCase() === "true";

export const featureFlags = {
  onboarding: toBool(process.env.NEXT_PUBLIC_FEATURE_ONBOARDING),
};

export const isOnboardingEnabled = () => featureFlags.onboarding;

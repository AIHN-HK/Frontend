export const lottieAssets = {
  advisor: { loop: true, source: 'https://lottiefiles.com/free-animation/orb-ai-assistant-aibaa-B9u3qlIbwH', author: 'AsadShiekh' },
  empty: { loop: false, source: 'https://lottiefiles.com/free-animation/empty-box-animation-EfC20FO7YI', author: 'Aadesh Kulkarni' },
  complete: { loop: false, source: 'https://lottiefiles.com/free-animation/success-check-zSLSFlcAJq', author: 'Pranav Patil' },
} as const;

export type LottieIllustrationKind = keyof typeof lottieAssets;

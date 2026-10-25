export const lottieAssets = {
  advisor: { loop: true, source: 'https://lottiefiles.com/free-animation/chatbot-jxCXfeBs3a', author: 'Ali Azgar' },
  empty: { loop: false, source: 'https://lottiefiles.com/free-animation/empty-box-animation-EfC20FO7YI', author: 'Aadesh Kulkarni' },
  complete: { loop: false, source: 'https://lottiefiles.com/free-animation/success-check-zSLSFlcAJq', author: 'Pranav Patil' },
} as const;

export type LottieIllustrationKind = keyof typeof lottieAssets;

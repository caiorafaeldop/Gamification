export const clerkAppearance = {
  layout: {
    socialButtonsPlacement: 'top' as const,
    socialButtonsVariant: 'blockButton' as const,
  },
  variables: {
    colorPrimary: '#0070f3',
    borderRadius: '0.5rem',
  },
  elements: {
    rootBox: 'w-full',
    card: 'shadow-none bg-transparent w-full',
    headerTitle: 'text-secondary dark:text-white font-display font-extrabold text-2xl',
    headerSubtitle: 'hidden',
    formButtonPrimary:
      'bg-primary hover:bg-blue-800 text-white font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 rounded-lg py-3',
    formFieldInput:
      'rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white focus:border-primary focus:ring-primary py-3 transition-colors',
    formFieldLabel: 'text-sm font-medium text-gray-700 dark:text-gray-300',
    socialButtonsBlockButton:
      'rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
    footerActionLink: 'text-primary font-bold hover:underline',
    identityPreviewEditButton: 'text-primary',
    formFieldAction: 'text-primary font-semibold hover:text-sky-400',
    dividerLine: 'bg-gray-300 dark:bg-gray-600',
    dividerText: 'text-gray-500 dark:text-gray-400',
    footer: 'hidden',
  },
};

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://aa0217f46f386118ed645c792ac79422@o4511395285172224.ingest.de.sentry.io/4511395306012752",
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 1,
  enableLogs: true,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.1,
  sendDefaultPii: true,

  // ✨ LISTA NEGRA DO NAVEGADOR (Evita spam de abas antigas)
  ignoreErrors: [
    "Failed to find Server Action",
    "Expected RSC response, got text/plain",
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

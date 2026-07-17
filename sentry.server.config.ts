import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://aa0217f46f386118ed645c792ac79422@o4511395285172224.ingest.de.sentry.io/4511395306012752",

  // Define how likely traces are sampled.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: false,

  // Enable sending user PII
  sendDefaultPii: true,

  // ✨ LISTA NEGRA: O Sentry descarta imediatamente sem usar a rede (Evita ETIMEDOUT)
  ignoreErrors: [
    "Failed to find Server Action",
    "Expected RSC response, got text/plain",
    "ETIMEDOUT",
    "Failed to proxy",
    "AggregateError",
    "Connection reset",
  ],

  // ✨ TRAVA DE SEGURANÇA EXTRA: Caso algo escape da lista acima
  beforeSend(event, hint) {
    const error = hint.originalException as Error;

    if (error?.message) {
      if (
        error.message.includes("Failed to find Server Action") ||
        error.message.includes("Expected RSC response, got text/plain") ||
        error.message.includes("ETIMEDOUT")
      ) {
        // Retornar null cancela o envio para a rede, salvando os Sockets do servidor
        return null;
      }
    }

    return event;
  },
});

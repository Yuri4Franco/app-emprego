// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://aa0217f46f386118ed645c792ac79422@o4511395285172224.ingest.de.sentry.io/4511395306012752",

  // Ajuste a amostragem em produção se o tráfego for muito alto (ex: 0.1 para 10%)
  tracesSampleRate: 1,

  // Captura erros de navegação no client-side do Next.js
  integrations: [
    Sentry.replayIntegration({
      // Se quiser gravar a tela do usuário quando der erro (opcional, consome quota)
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // O Replay grava vídeos da sessão. 0.1 = 10% de sessões normais, 1.0 = 100% se tiver erro
  replaysSessionSampleRate: 0, // Mantenha 0 se não quiser pagar por vídeos
  replaysOnErrorSampleRate: 0.1, // Grava a tela de 1 em 10 usuários que tiverem erro

  // ✨ A TRAVA DE SEGURANÇA PARA O NAVEGADOR DO USUÁRIO
  beforeSend(event, hint) {
    const error = hint.originalException as Error;

    if (error?.message) {
      // Ignora o erro de cache do Next.js e também o clássico erro ResizeObserver do navegador
      if (
        error.message.includes("Failed to find Server Action") ||
        error.message.includes("Expected RSC response, got text/plain") ||
        error.message.includes("ResizeObserver loop")
      ) {
        return null;
      }
    }

    return event;
  },
});

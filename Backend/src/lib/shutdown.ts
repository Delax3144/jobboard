type ShutdownOptions = {
  closeServer: () => Promise<void>;
  disconnectDatabase: () => Promise<void>;
  closeMailer: () => void;
  exit?: (code: number) => void;
  timeoutMs?: number;
};

export function createShutdown({
  closeServer,
  disconnectDatabase,
  closeMailer,
  exit = (code) => process.exit(code),
  timeoutMs = 10_000,
}: ShutdownOptions) {
  let pending: Promise<void> | undefined;

  return () => {
    if (pending) return pending;
    const deadline = setTimeout(() => {
      console.error("Server shutdown timed out");
      exit(1);
    }, timeoutMs);

    pending = (async () => {
      let exitCode = 0;
      try {
        for (const close of [closeServer, disconnectDatabase, closeMailer]) {
          try {
            await close();
          } catch (error) {
            exitCode = 1;
            console.error("Server shutdown failed", error);
          }
        }
      } finally {
        clearTimeout(deadline);
        exit(exitCode);
      }
    })();
    return pending;
  };
}

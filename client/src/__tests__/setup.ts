if (!globalThis.performance) {
  globalThis.performance = {
    now: () => Date.now(),
  } as Performance;
}

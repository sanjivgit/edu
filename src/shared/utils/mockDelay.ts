export function mockDelay(ms = 350): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

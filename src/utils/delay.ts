export const delayPreact = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// FT 15 длина
export const dimmingStepsTime = [
  0, 0.7, 1.0, 1.4, 2.0, 2.8, 4.0, 5.7, 8.0, 11.3, 16.0, 22.6, 32.0, 45.3, 64.0, 90.5,
];

// FR длина 14
export const dimmingSteps = [
  358, 253, 179, 127, 89.4, 63.3, 44.7, 31.6, 22.4, 15.8, 11.2, 7.9, 5.6, 4.0, 2.8,
].reverse();

export const getFadeRateByIndex = (index: number) => {
  return dimmingSteps[index] ?? dimmingSteps[0]; // дефолт на случай ошибки
};

export const getFadeTimeByIndex = (index: number) => {
  return dimmingStepsTime[index] ?? dimmingStepsTime[0];
};

export const getFadeRateIndexByValue = (value: number) => {
  return dimmingSteps.findIndex(step => step === value);
};

export const getFadeTimeIndexByValue = (value: number) => {
  return dimmingStepsTime.findIndex(step => step === value);
};

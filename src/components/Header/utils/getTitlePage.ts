export const getTitle = (pathname: string) => {
  // если это главная
  if (pathname === '/') return 'Главная';

  // Страница со всеми устройствами
  if (pathname === '/service/devices') return 'Драйверы';
  if (pathname === '/service/sensors') return 'Сенсоры';

  // Страница конкретного устройства (startsWith = '/service/devices/')
  if (pathname.startsWith('/service/devices/')) return 'Драйвер';
  if (pathname.startsWith('/service/sensors/')) return 'Сенсор';

  // Страница «Помещения»
  if (pathname === '/service/rooms') return 'Помещения и группы';
  if (pathname === '/settings') return 'Wi-Fi';

  // Если ничего не подошло
  return 'Страница';
};

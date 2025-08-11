export const giftData = [
  { code: 'HEART', name: 'Heart', tokenCost: 10, animationKey: 'heart-pop' },
  { code: 'STAR', name: 'Star', tokenCost: 25, animationKey: 'star-burst' },
  { code: 'FIRE', name: 'Fire', tokenCost: 50, animationKey: 'flame-rise', commandAction: 'overlay:fire' },
  { code: 'DIAMOND', name: 'Diamond', tokenCost: 120, animationKey: 'diamond-shine' },
  { code: 'ROCKET', name: 'Rocket', tokenCost: 200, animationKey: 'rocket-launch', commandAction: 'overlay:rocket' },
  { code: 'CROWN', name: 'Crown', tokenCost: 300, animationKey: 'crown-drop' },
  { code: 'RAINBOW', name: 'Rainbow', tokenCost: 180, animationKey: 'rainbow-arc' },
  { code: 'THUNDER', name: 'Thunder', tokenCost: 90, animationKey: 'thunder-strike' },
  { code: 'DRAGON', name: 'Dragon', tokenCost: 750, animationKey: 'dragon-fly', commandAction: 'overlay:dragon' },
  { code: 'GALAXY', name: 'Galaxy', tokenCost: 1000, animationKey: 'galaxy-spin', commandAction: 'overlay:galaxy' }
];

export const userSeedData = [
  { handle: 'alice', password: 'password123', tokens: 500, roles: ['viewer'] },
  { handle: 'bob', password: 'password123', tokens: 300, roles: ['viewer'] },
  { handle: 'streamer', password: 'password123', tokens: 1000, roles: ['viewer', 'streamer'] }
];

export const colors = {
  white:      '#FFFFFF',
  mist:       '#C8E7E9',
  ink:        '#203535',
  primary:    '#0099A3',
  slate:      '#344E4E',
  deep:       '#006269',
  // Derived tokens
  success:    '#0099A3',
  danger:     '#B3261E',
  disabled:   '#C8E7E9',
  surface:    '#FFFFFF',
  border:     '#C8E7E9',
} as const;

export const shadows = {
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  }
};

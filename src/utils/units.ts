/**
 * Fluid volume unit helpers (US Fluid Ounces & Milliliters)
 * Standard clinical conversion: 1 fl oz ~ 29.57 ml (clinically 30 ml)
 */

export const mlToOz = (ml: number): number => {
  if (!ml || isNaN(ml)) return 0;
  // Convert and round to nearest 0.5 or integer for clinical realism
  const oz = ml / 29.5735;
  return Math.round(oz * 10) / 10;
};

export const ozToMl = (oz: number): number => {
  if (!oz || isNaN(oz)) return 0;
  return Math.round(oz * 29.5735);
};

export const formatFluid = (
  volumeMl: number,
  preferredUnit: 'oz' | 'ml' = 'oz'
): { primary: string; secondary: string; oz: number; ml: number } => {
  const oz = mlToOz(volumeMl);
  const ml = Math.round(volumeMl);

  if (preferredUnit === 'oz') {
    return {
      primary: `${oz} oz`,
      secondary: `${ml} ml`,
      oz,
      ml,
    };
  }

  return {
    primary: `${ml} ml`,
    secondary: `${oz} oz`,
    oz,
    ml,
  };
};

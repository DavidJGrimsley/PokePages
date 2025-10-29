/**
 * Type color mapping - Single source of truth comes from JSON
 * Import the shared JSON so app code and Tailwind read the same values.
 */
import typeColors from '~/constants/style/typeColors.json';

export const TYPE_COLORS: Record<string, string> = typeColors as Record<string, string>;

/**
 * Get the color for a type ID
 * For dual types (e.g., "normal-fire"), returns the first type's color
 */
export function getTypeColor(typeId: string): string {
  // Handle dual types by getting the first type
  const primaryType = typeId.includes('-') ? typeId.split('-')[0] : typeId;
  return TYPE_COLORS[primaryType] || TYPE_COLORS.normal;
}

/**
 * Get colors for a dual type
 * Returns [primaryColor, secondaryColor]
 */
export function getDualTypeColors(typeId: string): [string, string] {
  if (!typeId.includes('-')) {
    const color = TYPE_COLORS[typeId] || TYPE_COLORS.normal;
    return [color, color];
  }
  
  const [type1, type2] = typeId.split('-');
  return [
    TYPE_COLORS[type1] || TYPE_COLORS.normal,
    TYPE_COLORS[type2] || TYPE_COLORS.normal,
  ];
}

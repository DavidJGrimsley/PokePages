# Lumiose City Map - Location Guide

Based on the circular Lumiose City map layout, here are the district locations:

## City Layout (Circular with 6 main districts)

```
                    North (Top)
                    { x: 50, y: 15 }
                         ⬆️
                    
       Northwest           Northeast
     { x: 25, y: 25 }   { x: 75, y: 25 }
            ⬉                  ⬈

    West                              East
{ x: 15, y: 50 } ⬅️     🎯     ➡️ { x: 85, y: 50 }
                   Center Plaza
                  { x: 50, y: 50 }

            ⬋                  ⬊
       Southwest           Southeast  
     { x: 25, y: 75 }   { x: 75, y: 75 }

                         ⬇️
                    South (Bottom)
                    { x: 50, y: 85 }
```

## District Coordinates

### Center
- **Prism Tower / Central Plaza**: `{ x: 50, y: 50 }`

### Outer Ring (Gates)
- **North Gate**: `{ x: 50, y: 10 }`
- **Northeast Sector**: `{ x: 75, y: 20 }`
- **East Gate**: `{ x: 85, y: 50 }`
- **Southeast Sector**: `{ x: 75, y: 80 }`
- **South Gate**: `{ x: 50, y: 90 }`
- **Southwest Sector**: `{ x: 25, y: 80 }`
- **West Gate**: `{ x: 15, y: 50 }`
- **Northwest Sector**: `{ x: 25, y: 20 }`

### Mid Ring (Districts)
- **North District**: `{ x: 50, y: 25 }`
- **Northeast District**: `{ x: 70, y: 32 }`
- **East District**: `{ x: 75, y: 50 }`
- **Southeast District**: `{ x: 70, y: 68 }`
- **South District**: `{ x: 50, y: 75 }`
- **Southwest District**: `{ x: 30, y: 68 }`
- **West District**: `{ x: 25, y: 50 }`
- **Northwest District**: `{ x: 30, y: 32 }`

### Circular Rings (Visible in map)
Based on the 6 large circles around the center:

#### Top Circle
- **Coordinates**: `{ x: 50, y: 23 }`

#### Top-Right Circle
- **Coordinates**: `{ x: 68, y: 35 }`

#### Bottom-Right Circle
- **Coordinates**: `{ x: 68, y: 65 }`

#### Bottom Circle
- **Coordinates**: `{ x: 50, y: 77 }`

#### Bottom-Left Circle
- **Coordinates**: `{ x: 32, y: 65 }`

#### Top-Left Circle
- **Coordinates**: `{ x: 32, y: 35 }`

## Notable Landmarks (to map)

### Pokemon Centers (suggested locations)
```typescript
{ id: 'pc-north', coordinates: { x: 50, y: 23 } },
{ id: 'pc-ne', coordinates: { x: 68, y: 35 } },
{ id: 'pc-se', coordinates: { x: 68, y: 65 } },
{ id: 'pc-south', coordinates: { x: 50, y: 77 } },
{ id: 'pc-sw', coordinates: { x: 32, y: 65 } },
{ id: 'pc-nw', coordinates: { x: 32, y: 35 } },
```

### Prism Tower (Center)
```typescript
{ id: 'prism-tower', coordinates: { x: 50, y: 50 } }
```

### Gates (Fast Travel)
```typescript
{ id: 'gate-n', coordinates: { x: 50, y: 8 } },
{ id: 'gate-e', coordinates: { x: 88, y: 50 } },
{ id: 'gate-s', coordinates: { x: 50, y: 92 } },
{ id: 'gate-w', coordinates: { x: 12, y: 50 } },
```

## Tips for Placing Markers

1. **Use the circles**: The map has 6 large circular areas - these are perfect for major buildings
2. **Outer edge**: y: 8-15 (top), y: 85-92 (bottom), x: 8-15 (left), x: 85-92 (right)
3. **Districts**: Each "slice" of the circle is a district
4. **Center is special**: { x: 50, y: 50 } should be the Prism Tower

## Quick Copy-Paste Templates

```typescript
// Pokemon Center
{
  id: 'pc-location',
  name: 'Pokemon Center - District Name',
  category: 'buildings',
  coordinates: { x: 50, y: 50 },
  completed: false,
  description: 'Heal your Pokemon'
},

// Boutique/Shop
{
  id: 'shop-location',
  name: 'Boutique Name',
  category: 'buildings',
  coordinates: { x: 50, y: 50 },
  completed: false,
  description: 'Purchase items and clothing'
},

// Fast Travel Point
{
  id: 'ft-location',
  name: 'Travel Point Name',
  category: 'fastTravel',
  coordinates: { x: 50, y: 50 },
  completed: false,
  description: 'Fast travel location'
},

// Hidden Item
{
  id: 'item-location',
  name: 'Hidden TM/Item',
  category: 'other',
  coordinates: { x: 50, y: 50 },
  completed: false,
  description: 'Item description'
},
```

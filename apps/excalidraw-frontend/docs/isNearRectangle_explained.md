
# isNearRectangle Function Documentation

## Purpose
The `isNearRectangle` function checks whether a given point is within a certain **threshold distance** of **any edge** of a rectangle.

This is useful for detecting if the mouse or any point is *"near"* the border of a drawn rectangle without needing to click exactly on it.

---

## Function Definition

```ts
export const isNearRectangle = (
  px: number,         // point X (e.g., mouse)
  py: number,         // point Y
  rx: number,         // rectangle top-left X
  ry: number,         // rectangle top-left Y
  width: number,      // rectangle width
  height: number,     // rectangle height
  threshold: number = 5
): boolean => {
  // Rectangle boundaries
  const left = rx;
  const right = rx + width;
  const top = ry;
  const bottom = ry + height;

  // Check if point is within "threshold" distance of any edge

  // Near left edge
  const nearLeft = Math.abs(px - left) <= threshold && py >= top - threshold && py <= bottom + threshold;

  // Near right edge
  const nearRight = Math.abs(px - right) <= threshold && py >= top - threshold && py <= bottom + threshold;

  // Near top edge
  const nearTop = Math.abs(py - top) <= threshold && px >= left - threshold && px <= right + threshold;

  // Near bottom edge
  const nearBottom = Math.abs(py - bottom) <= threshold && px >= left - threshold && px <= right + threshold;

  return nearLeft || nearRight || nearTop || nearBottom;
};
```

---

## Step-by-Step Explanation

### Step 1 — Find rectangle boundaries
We calculate:
- **left** = `rx`
- **right** = `rx + width`
- **top** = `ry`
- **bottom** = `ry + height`

These represent the edges of the rectangle.

### Step 2 — Check each edge

#### Left Edge
- Horizontal distance: `Math.abs(px - left)`
- Vertical alignment: `py` must be within `top - threshold` and `bottom + threshold`.

#### Right Edge
- Horizontal distance: `Math.abs(px - right)`
- Vertical alignment: `py` within range.

#### Top Edge
- Vertical distance: `Math.abs(py - top)`
- Horizontal alignment: `px` must be within `left - threshold` and `right + threshold`.

#### Bottom Edge
- Vertical distance: `Math.abs(py - bottom)`
- Horizontal alignment: `px` within range.

### Step 3 — Return Result
If **any** edge condition is `true`, return `true`.

---

## Example

Rectangle: `(rx=100, ry=100, width=200, height=150)`  
Threshold: `5`

| Point       | Near Which Edge? | Result |
|-------------|------------------|--------|
| (102, 150)  | Left Edge         | true   |
| (250, 98)   | Top Edge          | true   |
| (50, 50)    | None              | false  |

---

## Visual Diagram

```
   top edge
  ┌──────────────────────────────┐
  │                              │
left edge                        right edge
  │                              │
  │                              │
  └──────────────────────────────┘
            bottom edge
```

Points within the `threshold` area around these edges return **true**.

---

## Key Notes
- Works for any rectangle defined by **top-left corner, width, height**.
- `threshold` can be adjusted for sensitivity.
- Does not detect points *inside* the rectangle unless they are close to an edge.

# Detailed Explanation of `isNear` Function

This document explains the logic of the `isNear` function step-by-step, why each calculation is performed, and includes examples to help you understand the math.

---

## Purpose of the Function
The `isNear` function checks if a given point **(x, y)** (e.g., the mouse position on a canvas) is close to a **line segment** defined by two points **(x1, y1)** and **(x2, y2)** within a certain **threshold distance**.

---

## Code Overview
```ts
isNear(
  x: number, y: number,           // The point we want to check
  x1: number, y1: number,         // Start of the line segment
  x2: number, y2: number,         // End of the line segment
  threshold: number = 5           // Distance threshold to be considered "near"
): boolean {

  // Step 1: Create vectors
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  // Step 2: Projection of point vector onto line vector
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  let param = -1;
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let closestX, closestY;

  // Step 3: Find the closest point
  if (param < 0) {
    closestX = x1;
    closestY = y1;
  } else if (param > 1) {
    closestX = x2;
    closestY = y2;
  } else {
    closestX = x1 + param * C;
    closestY = y1 + param * D;
  }

  // Step 4: Distance check
  const dx = x - closestX;
  const dy = y - closestY;

  return Math.sqrt(dx * dx + dy * dy) < threshold;
}
```

---

## Step-by-Step Logic

### Step 1: Create Vectors
We create two vectors:
1. **A, B** → vector from the start of the line segment `(x1, y1)` to the point `(x, y)`.
   ```
   A = x - x1
   B = y - y1
   ```
2. **C, D** → vector from `(x1, y1)` to `(x2, y2)` (the entire segment).
   ```
   C = x2 - x1
   D = y2 - y1
   ```

📌 **Why?**
We need vectors to perform geometric calculations like projection.

**Example:**
If `(x1, y1) = (0, 0)`, `(x2, y2) = (10, 0)`, and `(x, y) = (5, 3)`:
```
A = 5 - 0 = 5
B = 3 - 0 = 3
C = 10 - 0 = 10
D = 0 - 0 = 0
```

---

### Step 2: Projection Calculation
We use **dot product** to find how far along the line segment the point projects.

Formula:
```
dot = A * C + B * D
lenSq = C * C + D * D
param = dot / lenSq
```

📌 **Why?**
- **dot** → measures how aligned two vectors are.
- **lenSq** → squared length of the segment.
- **param** → position along the segment:
  - `0` → start of segment
  - `1` → end of segment
  - Between `0` and `1` → somewhere in the middle.

**Example:**
From earlier:
```
dot = 5 * 10 + 3 * 0 = 50
lenSq = 10^2 + 0^2 = 100
param = 50 / 100 = 0.5  (middle of the segment)
```

---

### Step 3: Closest Point on Segment
We check `param`:
- `< 0` → closest to start point `(x1, y1)`.
- `> 1` → closest to end point `(x2, y2)`.
- Else → interpolate:
  ```
  closestX = x1 + param * C
  closestY = y1 + param * D
  ```

**Example:**
`closestX = 0 + 0.5 * 10 = 5`
`closestY = 0 + 0.5 * 0 = 0`

So, closest point = `(5, 0)`.

---

### Step 4: Distance from Point to Closest Point
We compute:
```
dx = x - closestX
dy = y - closestY
distance = sqrt(dx^2 + dy^2)
```
📌 **Why?**
We use **Pythagoras theorem** to find the Euclidean distance.

**Example:**
```
dx = 5 - 5 = 0
dy = 3 - 0 = 3
distance = sqrt(0^2 + 3^2) = 3
```
If threshold = `5`, since `3 < 5`, the point is considered "near".

---

## Canvas Context
If this is used in an HTML canvas, `(x, y)` is usually the **mouse position** and `(x1, y1)` and `(x2, y2)` are endpoints of drawn lines. This helps detect when the mouse is close enough to interact with the line (e.g., highlighting or erasing).

---

✅ **Final Summary**:
- Create vectors to represent positions.
- Project the point vector onto the segment vector.
- Find the closest point on the segment.
- Measure the distance to see if it's within the threshold.

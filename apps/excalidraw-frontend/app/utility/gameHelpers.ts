export const  isNearForPencil = (
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    threshold: number = 5
  ): boolean => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let closestX, closestY;

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

    const dx = x - closestX;
    const dy = y - closestY;
    return Math.sqrt(dx * dx + dy * dy) < threshold;
  }
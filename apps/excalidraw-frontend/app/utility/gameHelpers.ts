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

export const  isNearCircle = (
  x: number, y: number,
  cx: number, cy: number,
  radius: number,
  threshold: number = 5
): boolean => {
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return Math.abs(dist - radius) <= threshold;
}

export const  isNearForText = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  text: string,
  ctx: CanvasRenderingContext2D,
  threshold: number = 5
): boolean =>{
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = parseInt(ctx.font, 20) 
  return (
    x >= cx - threshold &&
    x <= cx + textWidth + threshold &&
    y >= cy - textHeight - threshold &&
    y <= cy + threshold
  );
}


export const isNearRectangle = (
  x: number,
  y: number,
  rx: number,
  ry: number,
  width: number,
  height: number,
  threshold: number = 5
): boolean => {
  const left = rx;
  const right = rx + width;
  const top = ry;
  const bottom = ry + height;
  const nearLeft = Math.abs(x - left) <= threshold && y >= top - threshold && y <= bottom + threshold;
  const nearRight = Math.abs(x - right) <= threshold && y >= top - threshold && y <= bottom + threshold;
  const nearTop = Math.abs(y - top) <= threshold && x >= left - threshold && x <= right + threshold;
  const nearBottom = Math.abs(y - bottom) <= threshold && x >= left - threshold && x <= right + threshold;

  return nearLeft || nearRight || nearTop || nearBottom;
};

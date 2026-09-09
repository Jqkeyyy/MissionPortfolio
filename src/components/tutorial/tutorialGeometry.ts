export interface TutorialTargetRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface TutorialGeometry {
  highlight: TutorialTargetRect;
  arrow: { left: number; top: number; below: boolean };
}

const clamp = (value: number, minimum: number, maximum: number) => (
  Math.min(Math.max(value, minimum), maximum)
);

export const getTutorialGeometry = (
  target: TutorialTargetRect,
  viewportWidth: number,
  viewportHeight: number,
): TutorialGeometry => {
  const viewportPadding = 6;
  const highlightLeft = clamp(target.left - 6, viewportPadding, viewportWidth - viewportPadding);
  const highlightTop = clamp(target.top - 6, viewportPadding, viewportHeight - viewportPadding);
  const highlightRight = clamp(target.left + target.width + 6, viewportPadding, viewportWidth - viewportPadding);
  const highlightBottom = clamp(target.top + target.height + 6, viewportPadding, viewportHeight - viewportPadding);
  const below = highlightTop < 180;

  return {
    highlight: {
      left: highlightLeft,
      top: highlightTop,
      width: Math.max(0, highlightRight - highlightLeft),
      height: Math.max(0, highlightBottom - highlightTop),
    },
    arrow: {
      left: (highlightLeft + highlightRight) / 2,
      top: below
        ? Math.min(viewportHeight - 28, highlightBottom + 28)
        : Math.max(28, highlightTop - 28),
      below,
    },
  };
};

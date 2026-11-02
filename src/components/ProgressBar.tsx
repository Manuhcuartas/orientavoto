interface Props {
  /** 1-based position of the current statement. */
  current: number;
  total: number;
}

/**
 * Visual progress only. The position is given as text next to it and announced
 * by the quiz's live region, so the bar itself is hidden from screen readers.
 */
export function ProgressBar({ current, total }: Props) {
  const percent = total === 0 ? 0 : (100 * current) / total;
  return (
    <div class="progress" aria-hidden="true">
      <div class="progress__fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

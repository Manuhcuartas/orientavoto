interface Props {
  siglas: string;
  /** `#RRGGBB`. Only a small mark next to the acronym; never carries information on its own. */
  color: string | undefined;
}

/** Same size, typeface and style for every party: acronym plus a small colour mark. */
export function PartyBadge({ siglas, color }: Props) {
  return (
    <span class="party-badge">
      <span class="party-badge__mark" style={color ? { background: color } : undefined} aria-hidden="true" />
      {siglas}
    </span>
  );
}

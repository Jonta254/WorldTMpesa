import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";

/*
  Renders a single money/number figure that eases toward its target via
  useAnimatedNumber. Kept as a component (not an inline hook call) so it
  can be used once per holdings row without violating the rules of hooks.
  `format` maps the animated number back to display text, so precision and
  the app's KES/crypto formatting are preserved — only the frames between
  values are interpolated.
*/
export default function AnimatedFigure({
  value,
  format,
  prefix = "",
  suffix = "",
  duration,
  className,
  animate = true,
}) {
  const animated = useAnimatedNumber(value, duration ? { duration } : undefined);
  const shown = animate ? animated : Number(value) || 0;
  return (
    <span className={className}>
      {prefix}
      {format(shown)}
      {suffix}
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString("en-IN"),
  );
  const [formatted, setFormatted] = useState(
    value.toLocaleString("en-IN"),
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      setFormatted(latest);
    });
    return () => unsubscribe();
  }, [display]);

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

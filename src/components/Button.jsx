
import { motion } from "motion/react";

export default function Button({
  children,
  variant = "primary",
  onClick,
  href,
  className = "",
  type = "button",
}) {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors duration-200";

  const variants = {
    primary:
      "bg-white text-black hover:bg-gray-200",
    secondary:
      "border border-white/15 bg-white/5 text-white hover:bg-white/10",
    ghost:
      "text-white/70 hover:bg-white/10 hover:text-white",
  };

  const classes = `${baseStyle} ${variants[variant]} ${className}`;

  const animation = {
    whileHover: { scale: 1.045 },
    whileTap: { scale: 0.96 },
    transition: { type: "spring", stiffness: 400, damping: 20 },
  };

  if (href) {
    return (
      <motion.a href={href} className={classes} {...animation}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={classes}
      {...animation}
    >
      {children}
    </motion.button>
  );
}

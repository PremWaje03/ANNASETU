import { motion } from "framer-motion";

function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  disabled = false,
  className = "",
  icon,
  ...props
}) {
  const classes = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    block ? "btn-block" : "",
    loading ? "is-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.015 }}
      whileTap={{ y: 0, scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : null}
      {!loading && icon ? <span className="btn-icon">{icon}</span> : null}
      <span>{children}</span>
    </motion.button>
  );
}

export default Button;

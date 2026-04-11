import { motion } from "framer-motion";

function Card({ children, title, subtitle, action, className = "", delay = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
      className={`card ${className}`.trim()}
    >
      {(title || subtitle || action) && (
        <header className="card-header">
          <div>
            {title ? <h3 className="card-title">{title}</h3> : null}
            {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
          </div>
          {action ? <div>{action}</div> : null}
        </header>
      )}
      <div className="card-body">{children}</div>
    </motion.article>
  );
}

export default Card;


import { motion } from "motion/react";
import { ArrowUpRight, Layers } from "lucide-react";
import Button from "./Button";

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="navbar"
    >
      <a href="#home" className="brand">
        <span className="brand-icon">
          <Layers size={20} />
        </span>
        <span>Linkspace</span>
      </a>

      <nav className="nav-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it works</a>
        <a href="#about">About</a>
      </nav>

      <div className="nav-actions">
        <a href="/login" className="login-link">
          Log in
        </a>

        <Button href="/signup">
          Get started <ArrowUpRight size={16} />
        </Button>
      </div>
    </motion.header>
  );
}

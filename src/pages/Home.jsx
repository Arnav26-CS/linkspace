import Floating3DParticles from "../components/Floating3DParticles";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Search,
  FolderOpen,
  CalendarDays,
  Sparkles,
  Globe,
  Star,
  Command,
  Layers,
  Plus,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Button from "../components/Button";

const features = [
  {
    icon: Bookmark,
    title: "Save everything",
    description:
      "Keep articles, websites, videos and useful resources together in one place.",
  },
  {
    icon: FolderOpen,
    title: "Organise your world",
    description:
      "Create collections, add tags and build your own organised digital library.",
  },
  {
    icon: Search,
    title: "Find things instantly",
    description:
      "Search through your saved resources and find exactly what you need.",
  },
  {
    icon: CalendarDays,
    title: "Your saved history",
    description:
      "See what you discovered and saved on any particular day.",
  },
];

const savedItems = [
  {
    title: "The Complete Guide to React",
    domain: "react.dev",
    category: "Development",
    color: "preview-purple",
    letter: "R",
  },
  {
    title: "Understanding Cybersecurity",
    domain: "owasp.org",
    category: "Cybersecurity",
    color: "preview-blue",
    letter: "O",
  },
  {
    title: "Exploring Artificial Intelligence",
    domain: "huggingface.co",
    category: "Artificial Intelligence",
    color: "preview-orange",
    letter: "H",
  },
];

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main id="home">
      <Navbar />

      {/* HERO */}
      <section
  className="hero section-container"
  style={{ position: "relative", isolation: "isolate" }}
>
    {/* FLOATING 3D PARTICLE BACKGROUND */}
<div
  aria-hidden="true"
  style={{
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    overflow: "hidden",
    borderRadius: "inherit",
  }}
>
  <Floating3DParticles
    color="#c4b5fd"
    depth={0.8}
    opacity={0.48}
    quantity={150}
  />
</div>
        <motion.div
          className="hero-content"
          style={{ position: "relative", zIndex: 1 }}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="announcement">
            <Sparkles size={14} />
            Your personal space on the internet
            <ArrowUpRight size={14} />
          </div>

          <h1>
            Everything worth
            <br />
            saving, <span>in one space.</span>
          </h1>

          <p className="hero-description">
            Your internet is full of interesting things.
            Don't lose them. Save, organise and rediscover
            everything you love with Linkspace.
          </p>

          <div className="hero-actions">
            <Button href="/signup">
              Get started for free <ArrowRight size={17} />
            </Button>

            <Button href="#features" variant="secondary">
              Explore features
            </Button>
          </div>

          <div className="hero-note">
            <span className="online-dot" />
            Your personal digital library starts here.
          </div>
        </motion.div>

        {/* PRODUCT PREVIEW */}
        <motion.div
          className="dashboard-preview"
          style={{ position: "relative", zIndex: 1 }}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <div className="preview-topbar">
            <div className="window-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="preview-address">
              <Globe size={12} /> linkspace.app
            </div>
            <Command size={15} className="muted-icon" />
          </div>

          <div className="preview-layout">
            <aside className="preview-sidebar">
              <div className="preview-brand">
                <Layers size={16} /> Linkspace
              </div>

              <div className="preview-menu-label">WORKSPACE</div>
              <div className="preview-menu active">
                <Layers size={14} /> Overview
              </div>
              <div className="preview-menu">
                <Bookmark size={14} /> All links
              </div>
              <div className="preview-menu">
                <Star size={14} /> Favourites
              </div>

              <div className="preview-menu-label">COLLECTIONS</div>
              <div className="preview-menu">
                <span className="collection-dot purple" /> Development
              </div>
              <div className="preview-menu">
                <span className="collection-dot blue" /> Learning
              </div>
              <div className="preview-menu">
                <span className="collection-dot orange" /> Inspiration
              </div>
            </aside>

            <div className="preview-main">
              <div className="preview-welcome">
                <div>
                  <span className="preview-greeting">YOUR WORKSPACE</span>
                  <h3>Your digital library.</h3>
                </div>
                <div className="preview-add">
                  <Plus size={15} />
                </div>
              </div>

              <div className="preview-search">
                <Search size={14} />
                Search your saved links...
                <span>⌘ K</span>
              </div>

              <div className="preview-stats">
                <div>
                  <span>Saved links</span>
                  <strong>128</strong>
                </div>
                <div>
                  <span>Collections</span>
                  <strong>08</strong>
                </div>
                <div>
                  <span>Favourites</span>
                  <strong>24</strong>
                </div>
              </div>

              <div className="preview-section-title">
                Recently saved <span>View all ↗</span>
              </div>

              <div className="preview-cards">
                {savedItems.map((item, index) => (
                  <motion.div
                    key={item.domain}
                    className="preview-card"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`preview-image ${item.color}`}>
                      {item.letter}
                    </div>
                    <div className="preview-card-info">
                      <strong>{item.title}</strong>
                      <span>{item.domain}</span>
                      <small>{item.category}</small>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="features-section section-container" id="features">
        <SectionHeading
          eyebrow="MADE FOR YOUR DISCOVERIES"
          title="A better way to save what matters."
          description="Everything you need to turn your scattered bookmarks into an organised personal library."
        />

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                className="feature-card"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -6 }}
              >
                <div className="feature-icon">
                  <Icon size={21} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <ArrowUpRight size={18} className="feature-arrow" />
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section section-container" id="how-it-works">
        <SectionHeading
          eyebrow="SIMPLE BY DESIGN"
          title="Three steps. One organised space."
          description="No complicated process. Just save what you love and find it whenever you need it."
        />

        <div className="steps-grid">
          <div className="step-card">
            <span>01</span>
            <Bookmark size={25} />
            <h3>Save</h3>
            <p>Paste a link and keep anything worth remembering.</p>
          </div>

          <div className="step-card">
            <span>02</span>
            <FolderOpen size={25} />
            <h3>Organise</h3>
            <p>Sort your discoveries into collections and categories.</p>
          </div>

          <div className="step-card">
            <span>03</span>
            <Search size={25} />
            <h3>Rediscover</h3>
            <p>Search and revisit your saved resources whenever you want.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section section-container" id="about">
        <div className="cta-inner">
          <Sparkles size={24} />
          <h2>Stop losing the things worth keeping.</h2>
          <p>
            Build your own little corner of the internet.
            Everything you love, organised in one space.
          </p>
          <Button href="/signup">
            Create your space <ArrowRight size={17} />
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer section-container">
        <a href="#home" className="brand">
          <span className="brand-icon">
            <Layers size={18} />
          </span>
          <span>Linkspace</span>
        </a>

        <span>Everything worth saving, in one space.</span>
        <a href="#home" className="footer-top">
          Back to top ↑
        </a>
      </footer>
    </main>
  );
}

import {Github} from "lucide-react";
import DemoRow from "./DemoRow";
import styles from "./LandingPage.module.css";

const DEMOS = [
  {
    href: "/editor/",
    title: "The Editor",
    description:
      "Canvas-like writing surface where source text and packed glyphs merge into one editable view.",
  },
  {
    href: "/aclock/",
    title: "AClocks",
    description:
      "World clocks that pack hour, minute, and second digits into animated square glyphs across time zones.",
  },
  {
    href: "https://www.typecampus.com/fight-for-kindness-gallery-2025?pgid=maasv5d321-b22ea6e7-6be1-4b74-83e0-33c9d3d25d56",
    title: "Stick Together to Make Peace",
    description: "A submission for Fight for Kindness 2025.",
  },
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <a
        href="https://github.com/pearmini/apack"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.githubLink}
        aria-label="View APack on GitHub"
      >
        <Github size={22} strokeWidth={1.75} />
      </a>

      <main className={styles.landing}>
        <header className={styles.header}>
          <h1 className={styles.title}>APACK</h1>
          <p className={styles.tagline}>
            Write English letters in the style of Chinese characters.
          </p>
        </header>

        <section className={styles.demos} aria-label="Demos">
          {DEMOS.map((demo) => (
            <DemoRow key={demo.href} {...demo} />
          ))}
        </section>
      </main>
    </div>
  );
}

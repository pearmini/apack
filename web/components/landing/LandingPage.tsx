import {Github} from "lucide-react";
import DemoRow from "./DemoRow";
import styles from "./LandingPage.module.css";

const DEMOS = [
  {
    href: "/editor/",
    title: "The Editor",
    description:
      "Canvas-like writing surface where source text and packed glyphs merge into one editable view.",
    tag: "EDITOR",
    tagColor: "var(--apack-orange)",
  },
  {
    href: "/aclock/",
    title: "AClocks",
    description:
      "World clocks that pack hour, minute, and second digits into animated square glyphs across time zones.",
    tag: "CLOCK",
    tagColor: "var(--apack-teal)",
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
            Alphabet-packing writing system — Latin text composed into Chinese-character-like glyphs.
            Type, pack, and export stamps, poems, and logos.
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

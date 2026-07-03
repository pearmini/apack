import Link from "next/link";
import styles from "./DemoRow.module.css";

type DemoRowProps = {
  href: string;
  title: string;
  description: string;
};

export default function DemoRow({href, title, description}: DemoRowProps) {
  const content = (
    <>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
    </>
  );

  if (href.startsWith("http")) {
    return (
      <a href={href} className={styles.demoRow} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={styles.demoRow}>
      {content}
    </Link>
  );
}

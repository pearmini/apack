import Link from "next/link";
import styles from "./DemoRow.module.css";

type DemoRowProps = {
  href: string;
  title: string;
  description: string;
};

export default function DemoRow({href, title, description}: DemoRowProps) {
  return (
    <Link href={href} className={styles.demoRow}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
    </Link>
  );
}

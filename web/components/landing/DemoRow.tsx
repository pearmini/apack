import Link from "next/link";
import styles from "./DemoRow.module.css";

type DemoRowProps = {
  href: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
};

export default function DemoRow({href, title, description, tag, tagColor}: DemoRowProps) {
  return (
    <Link href={href} className={styles.demoRow}>
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.tag}>
        <span className={styles.dot} style={{background: tagColor}} aria-hidden="true" />
        <span>{tag}</span>
      </div>
    </Link>
  );
}

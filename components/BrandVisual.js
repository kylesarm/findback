import Image from "next/image";
import Icon from "./Icon";
import styles from "./BrandVisual.module.css";

export default function BrandVisual({ dark = false }) {
  return (
    <div className={`${styles.visual} ${dark ? styles.dark : ""}`}>
      <div className={styles.orbit} aria-hidden="true" />
      <div className={styles.innerOrbit} aria-hidden="true" />
      <span className={styles.spark} aria-hidden="true" />
      <div className={styles.logoMark}>
        <Image src="/logo.svg" alt="Findmatch" width={681} height={792} loading="eager" />
      </div>
      <div className={`${styles.card} ${styles.report}`}>
        <span className={styles.blueIcon}><Icon name="search" className="size-5" /></span>
        <div><p className={styles.cardTitle}>Start with a report</p><p className={styles.cardCopy}>Every detail is a clue.</p></div>
      </div>
      <div className={`${styles.card} ${styles.match}`}>
        <span className={styles.tealIcon}><Icon name="matches" className="size-5" /></span>
        <div><p className={styles.cardTitle}>Find a connection</p><p className={styles.cardCopy}>Explore possible matches.</p></div>
      </div>
      <div className={`${styles.card} ${styles.verify}`}>
        <span className={styles.tealIcon}><Icon name="check" className="size-5" /></span>
        <div><p className={styles.cardTitle}>Back where it belongs</p><p className={styles.cardCopy}>Ownership verified first.</p></div>
      </div>
      <p className={styles.caption}>A little help. A happy return.</p>
    </div>
  );
}

import { useEffect } from "react";
import styles from "./Modal.module.css";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onMouseDown={onClose}
      className={styles.overlay}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={styles.panel}
      >
        <div
          className={styles.header}
        >
          <div>
            {title ? <h2 className={styles.title}>{title}</h2> : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={styles.closeButton}
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
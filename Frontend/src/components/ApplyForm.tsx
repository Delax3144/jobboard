import styles from "./ApplyForm.module.css";
import { apiErrorMessage } from '../lib/apiError';
import { useState, useRef, useId } from "react";
import api from "../lib/api";

const Icons = {
  Upload: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  File: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  X: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  Send: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
};

interface ApplyFormProps {
  jobId: string;
  jobTitle: string;
  onSuccess: () => void;
}

export default function ApplyForm({ jobId, jobTitle, onSuccess }: ApplyFormProps) {
  const fieldId = useId();
  const [coverLetter, setCoverLetter] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("coverLetter", coverLetter);
    if (file) formData.append("cv", file);

    try {
      await api.post("/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess();
    } catch (err: unknown) {
      console.error(err);
      setStatus("error");
      setErrorMsg(apiErrorMessage(err, "Failed to submit application. Please try again."));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      {status === "error" && (
        <div role="alert" className={styles.error}>
          <Icons.X /> {errorMsg}
        </div>
      )}

      <div>
        <label htmlFor={`${fieldId}-pitch`} className={styles.pitchLabel}>
          <span className={styles.labelText}>Motivation Pitch</span>
          <span className={styles.optional}>Optional</span>
        </label>
        <textarea id={`${fieldId}-pitch`}
          placeholder={`Why are you a great fit for the ${jobTitle} role?`}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          className={styles.textarea}


        />
      </div>

      <div>
        <label htmlFor={`${fieldId}-cv`} className={styles.resumeLabel}>
          Resume / CV
        </label>

        {!file ? (
          <button type="button"
            onClick={() => fileInputRef.current?.click()}
            className={styles.uploadButton}


          >
            <div className={styles.uploadIcon}>
              <Icons.Upload />
            </div>
            <div>
              <div className={styles.uploadTitle}>Click to upload your CV</div>
              <div className={styles.uploadHint}>PDF, DOC, DOCX (Max 5MB)</div>
            </div>
          </button>
        ) : (
          <div className={styles.selectedFile}>
            <div className={styles.fileInfo}>
              <div className={styles.fileIcon}><Icons.File /></div>
              <div className={styles.fileName}>
                {file.name}
              </div>
            </div>
            <button type="button" aria-label="Remove CV" onClick={clearFile} className={styles.removeButton}  >
              <Icons.X />
            </button>
          </div>
        )}
        <input
          id={`${fieldId}-cv`} type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
          className={styles.hiddenInput}
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className={styles.submit}


      >
        {status === "submitting" ? (
          "Sending Application..."
        ) : (
          <>Send Application <Icons.Send /></>
        )}
      </button>

      <div className={styles.consent}>
        By applying, you agree to share your platform profile and provided documents with the employer.
      </div>
    </form>
  );
}
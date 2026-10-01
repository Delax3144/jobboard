import { useId, type FormEvent } from 'react';
import styles from "./JobForm.module.css";
import type { useEmployer, JobFormField } from '../../hooks/useEmployer';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { LOCATIONS, LEVELS } from '../../hooks/useEmployer';

const Icons = {
  Plus: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
};

export default function JobForm({ form }: { form: ReturnType<typeof useEmployer>['form'] }) {
  const formId = useId();
  const fieldId = (field: JobFormField) => formId + '-' + field;
  const errorId = (field: JobFormField) => fieldId(field) + '-error';
  const errorProps = (field: JobFormField) => ({
    id: fieldId(field),
    'aria-invalid': Boolean(form.fieldErrors[field]),
    'aria-describedby': form.fieldErrors[field] ? errorId(field) : undefined,
  });
  const fieldError = (field: JobFormField) => form.fieldErrors[field] ? (
    <p id={errorId(field)} className={styles.fieldError}>{form.fieldErrors[field]}</p>
  ) : null;
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.handleSubmit();
  };

  return (
    <div id="job-form-section" className={styles.root}>

      <div className={styles.card}>

        <div className={styles.header}>
            <div className={styles.icon}><Icons.Plus /></div>
            <h2 className={styles.title}>{form.editingJobId ? "Edit Vacancy" : "Create New Role"}</h2>
        </div>

        <form onSubmit={handleSubmit} aria-label="Vacancy details" aria-busy={form.isSubmitting}>
          <fieldset className={styles.fields} disabled={form.isSubmitting}>
            <div>
              <label htmlFor="logoInput" className={styles.label}>Company Logo</label>
              <div className={styles.logoArea} >
                  <input id="logoInput" type="file" accept="image/*" onChange={e => form.setLogoFile(e.target.files?.[0] || null)} className={styles.logoInput} />
              </div>
            </div>

            <div>
              <label htmlFor={fieldId("title")} className={styles.label}>Job Title</label>
              <input {...errorProps("title")} className={styles.input} placeholder="e.g. Senior React Engineer" value={form.title} onChange={e => form.setTitle(e.target.value)} />
              {fieldError("title")}
            </div>

            <div>
              <label htmlFor={fieldId("companyName")} className={styles.label}>Company Name</label>
              <input {...errorProps("companyName")} className={styles.input} placeholder="ACME Corp" value={form.companyName} onChange={e => form.setCompanyName(e.target.value)} />
              {fieldError("companyName")}
            </div>

            <div className={styles.grid}>
              <div>
                <label htmlFor={fieldId("location")} className={styles.label}>Location</label>
                <select {...errorProps("location")} className={styles.select} value={form.location} onChange={e => form.setLocation(e.target.value)} >
                  {LOCATIONS.map(l => <option key={l} value={l} className={styles.option}>{l}</option>)}
                </select>
                {fieldError("location")}
              </div>
              <div>
                <label htmlFor={fieldId("level")} className={styles.label}>Level</label>
                <select {...errorProps("level")} className={styles.select} value={form.level} onChange={e => form.setLevel(e.target.value)} >
                  {LEVELS.map(lv => <option key={lv} value={lv} className={styles.option}>{lv}</option>)}
                </select>
                {fieldError("level")}
              </div>
            </div>

            <div className={styles.grid}>
              <div>
                <label htmlFor={fieldId("salaryFrom")} className={styles.label}>Salary From (PLN)</label>
                <input {...errorProps("salaryFrom")} className={styles.input} type="number" placeholder="10000" value={form.salaryFrom} onChange={e => form.setSalaryFrom(e.target.value)} />
                {fieldError("salaryFrom")}
              </div>
              <div>
                <label htmlFor={fieldId("salaryTo")} className={styles.label}>Salary To (PLN)</label>
                <input {...errorProps("salaryTo")} className={styles.input} type="number" placeholder="20000" value={form.salaryTo} onChange={e => form.setSalaryTo(e.target.value)} />
                {fieldError("salaryTo")}
              </div>
            </div>

            <div>
              <label htmlFor={fieldId("tags")} className={styles.label}>Tech Stack (Tags)</label>
              <input {...errorProps("tags")} className={styles.input} placeholder="React, Node.js, AWS..." value={form.tags} onChange={e => form.setTags(e.target.value)} />
              {fieldError("tags")}
            </div>

            <div>
              <span id={fieldId("description")} className={styles.label}>Job Description</span>
              <div className={styles.editor} role="group" aria-labelledby={fieldId("description")} aria-describedby={form.fieldErrors.description ? errorId("description") : undefined}>
                <ReactQuill readOnly={form.isSubmitting} theme="snow" value={form.description} onChange={form.setDescription} placeholder="Roles, responsibilities and benefits..." />
              </div>
            </div>

            {fieldError("description")}
            <div className={styles.actions}>
              <button
                type="submit" disabled={form.isSubmitting}
                className={styles.submit}
              >
                {form.isSubmitting ? "Saving Vacancy..." : form.editingJobId ? "Update Job Posting" : "Launch Vacancy"}
              </button>

              {form.editingJobId && (
                <button type="button" onClick={form.resetForm} className={styles.cancel} >
                  Cancel Edits
                </button>
              )}
            </div>
          </fieldset>
          {form.submitError && <p role="alert" className={styles.submitError}>{form.submitError}</p>}
        </form>
      </div>
    </div>
  );
}
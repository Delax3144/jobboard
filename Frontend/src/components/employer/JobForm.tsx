import styles from "./JobForm.module.css";
import type { useEmployer } from '../../hooks/useEmployer';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { LOCATIONS, LEVELS } from '../../hooks/useEmployer';

const Icons = {
  Plus: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
};


export default function JobForm({ form }: { form: ReturnType<typeof useEmployer>['form'] }) {
  return (
    <div id="job-form-section" className={styles.root}>



      <div className={styles.card}>

        <div className={styles.header}>
            <div className={styles.icon}><Icons.Plus /></div>
            <h2 className={styles.title}>{form.editingJobId ? "Edit Vacancy" : "Create New Role"}</h2>
        </div>

        <div className={styles.fields}>
          <div>
            <label className={styles.label}>Company Logo</label>
            <div className={styles.logoArea} >
                <input id="logoInput" type="file" accept="image/*" onChange={e => form.setLogoFile(e.target.files?.[0] || null)} className={styles.logoInput} />
            </div>
          </div>

          <div>
            <label className={styles.label}>Job Title</label>
            <input className={styles.input} placeholder="e.g. Senior React Engineer" value={form.title} onChange={e => form.setTitle(e.target.value)} />
          </div>

          <div>
            <label className={styles.label}>Company Name</label>
            <input className={styles.input} placeholder="ACME Corp" value={form.companyName} onChange={e => form.setCompanyName(e.target.value)} />
          </div>

          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Location</label>
              <select className={styles.select} value={form.location} onChange={e => form.setLocation(e.target.value)} >
                {LOCATIONS.map(l => <option key={l} value={l} className={styles.option}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={styles.label}>Level</label>
              <select className={styles.select} value={form.level} onChange={e => form.setLevel(e.target.value)} >
                {LEVELS.map(lv => <option key={lv} value={lv} className={styles.option}>{lv}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Salary From (PLN)</label>
              <input className={styles.input} type="number" placeholder="10000" value={form.salaryFrom} onChange={e => form.setSalaryFrom(e.target.value)} />
            </div>
            <div>
              <label className={styles.label}>Salary To (PLN)</label>
              <input className={styles.input} type="number" placeholder="20000" value={form.salaryTo} onChange={e => form.setSalaryTo(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={styles.label}>Tech Stack (Tags)</label>
            <input className={styles.input} placeholder="React, Node.js, AWS..." value={form.tags} onChange={e => form.setTags(e.target.value)} />
          </div>

          <div>
            <label className={styles.label}>Job Description</label>
            <div className={styles.editor}>
              <ReactQuill theme="snow" value={form.description} onChange={form.setDescription} placeholder="Roles, responsibilities and benefits..." />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              onClick={form.handleSubmit}
              className={styles.submit}


            >
              {form.editingJobId ? "Update Job Posting" : "Launch Vacancy"}
            </button>

            {form.editingJobId && (
              <button onClick={form.resetForm} className={styles.cancel} >
                Cancel Edits
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
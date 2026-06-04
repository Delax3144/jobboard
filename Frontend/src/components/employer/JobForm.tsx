// src/components/employer/JobForm.tsx
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { LOCATIONS, LEVELS } from '../../hooks/useEmployer';

const Icons = {
  Plus: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
};

const inputStyle = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff', width: '100%', padding: '16px 20px', borderRadius: '16px', 
  transition: 'border-color 0.2s', outline: 'none', fontSize: '14px'
};

export default function JobForm({ form }: { form: any }) {
  return (
    <div id="job-form-section" style={{ position: 'sticky', top: '100px', scrollMarginTop: '100px' }}>
      
      <style>{`
        .quill-dark .ql-toolbar { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08) !important; border-bottom: none !important; border-radius: 16px 16px 0 0; padding: 12px; }
        .quill-dark .ql-container { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 0 0 16px 16px; color: #fff; font-family: inherit; font-size: 15px; }
        .quill-dark .ql-editor { min-height: 200px; padding: 20px; }
        .quill-dark .ql-editor.ql-blank::before { color: #666; font-style: normal; }
        .quill-dark .ql-stroke { stroke: #aaa; }
        .quill-dark .ql-fill { fill: #aaa; }
        .quill-dark .ql-picker { color: #aaa; }
        .quill-dark .ql-picker-options { background: #111; border: 1px solid #333; }
      `}</style>

      <div style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '35px' }}>
            <div style={{ padding: '10px', background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))', color: '#10b981', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}><Icons.Plus /></div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>{form.editingJobId ? "Edit Vacancy" : "Create New Role"}</h2>
        </div>

        <div style={{ display: 'grid', gap: '25px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Company Logo</label>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', padding: '25px', borderRadius: '20px', textAlign: 'center', transition: 'border-color 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'} onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                <input id="logoInput" type="file" accept="image/*" onChange={e => form.setLogoFile(e.target.files?.[0] || null)} style={{ fontSize: '13px', color: '#888' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Job Title</label>
            <input style={inputStyle} placeholder="e.g. Senior React Engineer" value={form.title} onChange={e => form.setTitle(e.target.value)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Company Name</label>
            <input style={inputStyle} placeholder="ACME Corp" value={form.companyName} onChange={e => form.setCompanyName(e.target.value)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
          </div>

          <div className="m-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</label>
              <select style={{...inputStyle, appearance: 'auto'}} value={form.location} onChange={e => form.setLocation(e.target.value)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}>
                {LOCATIONS.map(l => <option key={l} value={l} style={{background: '#111'}}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Level</label>
              <select style={{...inputStyle, appearance: 'auto'}} value={form.level} onChange={e => form.setLevel(e.target.value)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}>
                {LEVELS.map(lv => <option key={lv} value={lv} style={{background: '#111'}}>{lv}</option>)}
              </select>
            </div>
          </div>

          <div className="m-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Salary From (PLN)</label>
              <input style={inputStyle} type="number" placeholder="10000" value={form.salaryFrom} onChange={e => form.setSalaryFrom(e.target.value)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Salary To (PLN)</label>
              <input style={inputStyle} type="number" placeholder="20000" value={form.salaryTo} onChange={e => form.setSalaryTo(e.target.value)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Tech Stack (Tags)</label>
            <input style={inputStyle} placeholder="React, Node.js, AWS..." value={form.tags} onChange={e => form.setTags(e.target.value)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Job Description</label>
            <div className="quill-dark">
              <ReactQuill theme="snow" value={form.description} onChange={form.setDescription} placeholder="Roles, responsibilities and benefits..." />
            </div>
          </div>

          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button 
              onClick={form.handleSubmit} 
              style={{ 
                background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', 
                padding: '18px', borderRadius: '16px', fontWeight: 800, fontSize: '16px', 
                border: 'none', cursor: 'pointer', transition: 'transform 0.2s',
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {form.editingJobId ? "Update Job Posting" : "Launch Vacancy"}
            </button>
            
            {form.editingJobId && (
              <button onClick={form.resetForm} style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#888', background: 'transparent', padding: '16px', borderRadius: '16px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseOut={e => {e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent'}}>
                Cancel Edits
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
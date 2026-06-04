// src/components/jobs/JobsFilters.tsx
import { FILTER_LOCATIONS, FILTER_LEVELS, MAX_SALARY_LIMIT } from "../../hooks/useJobs";

const Icons = {
  Filter: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>,
};

export default function JobsFilters({ filters }: { filters: any }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Filter /> Filters
        </h4>
        <button onClick={filters.clearAllFilters} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
          Clear All
        </button>
      </div>
      
      <div style={{ marginBottom: '35px' }}>
        <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '15px', fontWeight: 800 }}>Location</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FILTER_LOCATIONS.map(loc => (
            <label key={loc} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', color: filters.selectedLocations.includes(loc) ? '#fff' : '#888', fontWeight: filters.selectedLocations.includes(loc) ? 600 : 400 }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '6px', border: filters.selectedLocations.includes(loc) ? 'none' : '1px solid #444', background: filters.selectedLocations.includes(loc) ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {filters.selectedLocations.includes(loc) && <span style={{ color: '#000', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
              </div>
              <input type="checkbox" checked={filters.selectedLocations.includes(loc)} onChange={() => filters.toggleFilter(filters.setSelectedLocations, loc)} style={{ display: 'none' }} /> 
              {loc}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '35px' }}>
        <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '15px', fontWeight: 800 }}>Experience Level</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {FILTER_LEVELS.map(lv => {
            const isActive = filters.selectedLevels.includes(lv);
            return (
              <button key={lv} onClick={() => filters.toggleFilter(filters.setSelectedLevels, lv)} style={{ background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)', border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.08)', color: isActive ? '#10b981' : '#888', borderRadius: '12px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                {lv}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '15px', fontWeight: 800 }}>Salary Range (PLN)</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '11px', color: '#444', display: 'block', marginBottom: '4px', fontWeight: 600 }}>MIN</span>
            <input type="number" value={filters.minSalary} onChange={(e) => filters.setMinSalary(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', background: '#000', border: '1px solid rgba(255,255,255,0.08)', padding: '10px', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '11px', color: '#444', display: 'block', marginBottom: '4px', fontWeight: 600 }}>MAX</span>
            <input type="number" value={filters.maxSalary} onChange={(e) => filters.setMaxSalary(Math.max(filters.minSalary, parseInt(e.target.value) || 0))} style={{ width: '100%', background: '#000', border: '1px solid rgba(255,255,255,0.08)', padding: '10px', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }} />
          </div>
        </div>
        <div style={{ padding: '0 5px' }}>
          <input type="range" min="0" max={MAX_SALARY_LIMIT} step="1000" value={filters.maxSalary > MAX_SALARY_LIMIT ? MAX_SALARY_LIMIT : filters.maxSalary} onChange={(e) => filters.setMaxSalary(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: '11px', marginTop: '5px', fontWeight: 600 }}>
            <span>0</span>
            <span>{MAX_SALARY_LIMIT.toLocaleString()}+ PLN</span>
          </div>
        </div>
      </div>
    </>
  );
}
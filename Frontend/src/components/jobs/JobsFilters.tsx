import styles from "./JobsFilters.module.css";
import type { useJobs } from '../../hooks/useJobs';
import { FILTER_LOCATIONS, FILTER_LEVELS, MAX_SALARY_LIMIT } from "../../hooks/useJobs";

const Icons = {
  Filter: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>,
};

export default function JobsFilters({ filters }: { filters: ReturnType<typeof useJobs>['filters'] }) {
  return (
    <>
      <div className={styles.header}>
        <h4 className={styles.title}>
          <Icons.Filter /> Filters
        </h4>
        <button type="button" onClick={filters.clearAllFilters} className={styles.clearButton}>
          Clear All
        </button>
      </div>
      
      <div className={styles.section}>
        <label className={styles.label}>Location</label>
        <div className={styles.locations}>
          {FILTER_LOCATIONS.map(loc => (
            <label key={loc} className={styles.location} data-selected={filters.selectedLocations.includes(loc)}>
              <input type="checkbox" checked={filters.selectedLocations.includes(loc)} onChange={() => filters.toggleFilter(filters.setSelectedLocations, loc)} className={styles.checkbox} />
              {loc}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Experience Level</label>
        <div className={styles.levels}>
          {FILTER_LEVELS.map(lv => {
            const isActive = filters.selectedLevels.includes(lv);
            return (
              <button type="button" aria-pressed={isActive} key={lv} onClick={() => filters.toggleFilter(filters.setSelectedLevels, lv)} className={styles.level}>
                {lv}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={styles.label}>Salary Range (PLN)</label>
        <div className={styles.salaryRow}>
          <div className={styles.salaryField}>
            <span className={styles.salaryLabel}>MIN</span>
            <input aria-label="Minimum salary in PLN" type="number" value={filters.minSalary} onChange={(e) => filters.setMinSalary(Math.max(0, parseInt(e.target.value) || 0))} className={styles.salaryInput} />
          </div>
          <div className={styles.salaryField}>
            <span className={styles.salaryLabel}>MAX</span>
            <input aria-label="Maximum salary in PLN" type="number" value={filters.maxSalary} onChange={(e) => filters.setMaxSalary(Math.max(filters.minSalary, parseInt(e.target.value) || 0))} className={styles.salaryInput} />
          </div>
        </div>
        <div className={styles.sliderContainer}>
          <input aria-label="Maximum salary slider in PLN" type="range" min="0" max={MAX_SALARY_LIMIT} step="1000" value={filters.maxSalary > MAX_SALARY_LIMIT ? MAX_SALARY_LIMIT : filters.maxSalary} onChange={(e) => filters.setMaxSalary(parseInt(e.target.value))} className={styles.slider} />
          <div className={styles.scale}>
            <span>0</span>
            <span>{MAX_SALARY_LIMIT.toLocaleString()}+ PLN</span>
          </div>
        </div>
      </div>
    </>
  );
}

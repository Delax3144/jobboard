import { Link } from "react-router-dom";
import { useEmployer } from "../../hooks/useEmployer";
import JobForm from "../../components/employer/JobForm";
import LoadError from "../../components/LoadError";

import styles from "./Employer.module.css";

const Icons = {
  Briefcase: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Users: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Edit: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Trash: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Settings: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
};

export default function Employer() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { data, list, form } = useEmployer();

  if (data.isLoading && !data.error) return <div role="status" className={styles.loading}>Loading Admin Console...</div>;

  return (
    <div className={styles.page}>

      <div className={styles.greenGlow} />
      <div className={styles.blueGlow} />

      <div className={styles.container}>

        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>
              Management Console
            </div>
            <h1 className={styles.title}>
              Employer <span className={styles.titleGradient}>Hub</span>
            </h1>
            <p className={styles.subtitle}>Manage your talent pipeline and active job postings.</p>
          </div>

          <div className={styles.stats}>
              <div className={styles.activeStat}>
                  <div className={styles.activeLabel}>Active Ads</div>
                  <div className={styles.statValue}>{data.error ? '—' : data.dashboardStats.active}</div>
              </div>
              <div className={styles.applicationsStat}>
                  <div className={styles.applicationsLabel}>New Apps</div>
                  <div className={styles.statValue}>{data.error ? '—' : data.dashboardStats.newApps}</div>
              </div>
          </div>
        </div>

        <div className={styles.layout}>

          <div className={styles.vacancies}>

            <div className={styles.listHeader}>
              <div className={styles.sectionHeading}>
                <span className={styles.accent}><Icons.Briefcase /></span>
                <h2 className={styles.sectionTitle}>Your Vacancies</h2>
              </div>

              {data.jobs.length > 0 && (
                <div className={styles.searchField}>
                  <div className={styles.searchIcon}><Icons.Search /></div>
                  <input
                    type="text" placeholder="Search by title..." value={list.searchQuery}
                    onChange={(e) => { list.setSearchQuery(e.target.value); list.setCurrentPage(1); }}
                    className={styles.searchInput}
                  />
                </div>
              )}
            </div>

            {data.error && <LoadError message={data.error} loading={data.isLoading} onRetry={data.retry} />}
            {!data.error && list.filteredJobs.length === 0 && data.jobs.length > 0 && (
              <div className={styles.noMatches}>No vacancies match your search.</div>
            )}

            {!data.error && data.jobs.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📋</div>
                <h3 className={styles.emptyTitle}>No vacancies posted yet</h3>
                <p className={styles.emptyDescription}>Start by creating your first job listing on the right.</p>
              </div>
            )}

            {!data.error && list.currentJobs.map((job) => {
              const jobApps = data.applications.filter((a) => a.jobId === job.id);
              const newAppsCount = jobApps.filter((a) => a.status === 'new').length;

              return (
                <div key={job.id} className={styles.jobCard} >
                  <div className={styles.highlight} />
                  <div className={styles.cardHeader}>
                    <div className={styles.jobInfo}>
                      <div className={styles.logo}>
                          {job.companyLogo ? <img src={job.companyLogo?.startsWith('http') ? job.companyLogo : `${apiUrl}${job.companyLogo}`} alt="logo" className={styles.logoImage} /> : <span className={styles.logoFallback}>{job.companyName[0].toUpperCase()}</span>}
                      </div>
                      <div className={styles.jobContent}>
                        <div className={styles.jobHeading}>
                          <h3 className={styles.jobTitle}>{job.title}</h3>
                          <span className={styles.status} data-published={job.status === "published"}>{job.status}</span>
                        </div>
                        <div className={styles.metadata}>
                          <span className={styles.company}>{job.companyName}</span>
                          <span className={styles.separator}></span>
                          <span className={styles.location}>{job.location}</span>
                          <span className={styles.separator}></span>
                          <span className={styles.salary}>{job.salaryFrom} – {job.salaryTo} PLN</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.actions}>
                      <button onClick={() => list.fillForm(job)} className={styles.editButton}   title="Edit"><Icons.Edit /></button>
                      <button onClick={() => list.handleDelete(job.id)} className={styles.deleteButton}   title="Delete"><Icons.Trash /></button>
                      <Link to={`/employer/job/${job.id}`} className={styles.manageLink} >Manage <Icons.Settings /></Link>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.applicants}>
                      <span className={styles.muted}><Icons.Users /></span>
                      <span className={styles.applicantCount}>Total Applicants: <b className={styles.white}>{jobApps.length}</b> {newAppsCount > 0 && <span className={styles.newCount}>{newAppsCount} New</span>}</span>
                    </div>
                    <div className={styles.avatars}>
                      {jobApps.slice(0, 5).map((app) => (
                          <div key={app.id} className={styles.avatar}>
                              {app.candidate.email[0].toUpperCase()}
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {!data.error && list.totalPages > 1 && (
              <div className={styles.pagination}>
                <button onClick={() => list.setCurrentPage((p: number) => Math.max(1, p - 1))} disabled={list.currentPage === 1} className={styles.pageButton}>Prev</button>
                <span className={styles.pageLabel}>Page <span className={styles.white}>{list.currentPage}</span> of {list.totalPages}</span>
                <button onClick={() => list.setCurrentPage((p: number) => Math.min(list.totalPages, p + 1))} disabled={list.currentPage === list.totalPages} className={styles.pageButton}>Next</button>
              </div>
            )}
          </div>

          <JobForm form={form} />
        </div>
      </div>
    </div>
  );
}

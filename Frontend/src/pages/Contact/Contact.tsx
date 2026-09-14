import { useContact } from "../../hooks/useContact";
import styles from "./Contact.module.css";

const Icons = {
  Email: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>,
  Clock: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  Chat: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>,
  Check: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>,
  ArrowRight: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>,
  Ticket: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
  ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
};

export default function Contact() {
  const { user, view, setView, tickets, formData, status, setStatus, errorMsg, handleChange, handleSubmit } = useContact();

  return (
    <div className={styles.page}>
      <div className={styles.greenGlow} />
      <div className={styles.blueGlow} />

      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.badge}>
            Support Center
          </div>
          <h1 className={styles.title}>
            {view === "form" ? (
              <>How can we <span className={styles.titleGradient}>help you?</span></>
            ) : (
              <>Your <span className={styles.titleGradient}>Support Tickets</span></>
            )}
          </h1>
          <p className={styles.description}>
            {view === "form"
              ? "Have a question, feedback, or need help with your account? Our dedicated support team is here to assist you every step of the way."
              : "Review the status of your previous support requests and keep track of our conversations."}
          </p>
        </div>

        <div className={styles.layout}>
          <div className={styles.infoCard}>

            <div>
              <h3 className={styles.cardTitle}>Contact Information</h3>
              <p className={styles.infoDescription}>
                Fill out the form and our technical support team will get back to you. We prioritize critical issues to keep your hiring process smooth.
              </p>
            </div>

            <div className={styles.contactDetails}>
              <div className={styles.contactRow}>
                <div className={styles.greenIcon}>
                  <Icons.Email />
                </div>
                <div>
                  <div className={styles.detailLabel}>Email Us Direct</div>
                  <div className={styles.detailValue}>support@jobboard.com</div>
                </div>
              </div>

              <div className={styles.contactRow}>
                <div className={styles.greenIcon}>
                  <Icons.Clock />
                </div>
                <div>
                  <div className={styles.detailLabel}>Average Response Time</div>
                  <div className={styles.detailValue}>Under 24 hours</div>
                </div>
              </div>

              <div className={styles.contactRow}>
                <div className={styles.blueIcon}>
                  <Icons.Chat />
                </div>
                <div>
                  <div className={styles.detailLabel}>General Inquiries</div>
                  <div className={styles.detailValue}>hello@jobboard.com</div>
                </div>
              </div>
            </div>

            {user && (
              <div className={styles.ticketNavigation}>
                <div className={styles.divider} />
                <button
                  onClick={() => setView(view === "form" ? "tickets" : "form")}
                  className={styles.viewButton}
                  data-tickets={view === "tickets"}
                >
                  {view === "form" ? <><Icons.Ticket /> View My Tickets</> : <><Icons.ArrowLeft /> Back to Form</>}
                </button>
              </div>
            )}
          </div>
          <div className={styles.contentCard}>

            {view === "form" ? (
              status === "success" ? (
                <div className={styles.success}>
                  <div className={styles.successIconWrapper}>
                    <div className={styles.successIcon}>
                      <Icons.Check />
                    </div>
                  </div>
                  <h3 className={styles.cardTitle}>Message Sent!</h3>
                  <p className={styles.successDescription}>
                    Thank you for reaching out. A ticket has been created and our support team will get back to your email shortly.
                  </p>
                  <button
                    onClick={() => { setStatus("typing"); if(user) setView("tickets"); }}
                    className={styles.secondaryButton}
                  >
                    {user ? "View My Tickets" : "Send another message"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>

                  {status === "error" && (
                    <div className={styles.error}>
                      {errorMsg}
                    </div>
                  )}

                  <div className={styles.fieldsGrid}>
                    <div>
                      <label className={styles.label}>Full Name *</label>
                      <input required name="name" value={formData.name} onChange={handleChange} className={styles.input} placeholder="John Doe" />
                    </div>
                    <div>
                      <label className={styles.label}>Email Address *</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className={styles.input} placeholder="john@example.com" />
                    </div>
                  </div>

                  <div>
                    <label className={styles.label}>Subject</label>
                    <input name="subject" value={formData.subject} onChange={handleChange} className={styles.input} placeholder="How can we help?" />
                  </div>

                  <div>
                    <label className={styles.label}>Message *</label>
                    <textarea required name="message" value={formData.message} onChange={handleChange} className={styles.textarea} placeholder="Please describe your issue in detail..." ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className={styles.submitButton}
                  >
                    {status === "sending" ? "Sending Request..." : <>Submit Request <Icons.ArrowRight /></>}
                  </button>
                </form>
              )
            ) : (
              <div className={styles.tickets}>
                <h3 className={styles.ticketsTitle}>
                  <Icons.Ticket /> Open Requests
                </h3>

                <div className={styles.ticketList}>
                  {tickets.length === 0 ? (
                    <div className={styles.emptyTickets}>
                      <Icons.Chat />
                      <p className={styles.emptyDescription}>You haven't sent any support tickets yet.</p>
                    </div>
                  ) : (
                    tickets.map(t => (
                      <div key={t.id} className={styles.ticketCard}>

                        <div className={styles.ticketHeader}>
                          <span className={styles.ticketId}>Ticket #{t.id.slice(0, 8).toUpperCase()}</span>
                          <span className={styles.ticketStatus} data-resolved={t.status === "Resolved"}>
                            {t.status}
                          </span>
                        </div>

                        <div className={styles.ticketSubject}>{t.subject || "General Inquiry"}</div>
                        <div className={styles.ticketMessage}>
                          {t.message.length > 150 ? t.message.slice(0, 150) + "..." : t.message}
                        </div>

                        <div className={styles.ticketDate}>
                          <Icons.Clock /> Submitted on {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

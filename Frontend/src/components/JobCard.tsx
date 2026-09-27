import styles from "./JobCard.module.css";

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  salary?: string;
  tags?: string[];
}

const JobCard = ({ title, company, location, salary, tags }: JobCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.company}>{company}</p>
          <p className={styles.location}>{location}</p>
        </div>
        {salary && (
          <div className={styles.salary}>
            {salary}
          </div>
        )}
      </div>

      {tags && tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map(tag => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobCard;
import type { Application } from '../types/job';

export const applicationStatusLabels: Record<Application['status'], string> = {
  new: 'New', reviewed: 'Reviewed', invited: 'Interview', rejected: 'Declined',
};

export interface NotificationEvent {
  type: 'new_message' | 'new_application' | 'status_update';
  applicationId?: string;
  message?: string;
  jobTitle?: string;
}

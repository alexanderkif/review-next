export interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface AdminSettingsProps {
  user: AdminUser;
}

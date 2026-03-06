export interface UserStatusEntry {
  email: string;
  status: 'allowed' | 'blacklisted' | 'admin';
  reason?: string;
}

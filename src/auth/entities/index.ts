export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Array<{
    permissions: Array<{
      name: string;
    }>;
  }>;
  member?: {
    id: string;
  };
}

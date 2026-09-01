// Team Member 1: Auth & User Management

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'investigator' | 'analyst' | 'officer';
  badgeNumber?: string;
  department?: string;
}

export class UserModel {
  // Database schema / ORM model for users
}

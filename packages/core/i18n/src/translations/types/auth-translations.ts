/**
 * Auth package translations
 * Authentication and user management translations
 */

export interface AuthTranslations {
  login: {
    title: string;
    username: string;
    password: string;
    remember: string;
    forgot: string;
    submit: string;
    success: string;
    failed: string;
  };
  register: {
    title: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    submit: string;
    success: string;
    failed: string;
  };
  logout: {
    title: string;
    confirm: string;
    success: string;
  };
  profile: {
    title: string;
    edit: string;
    save: string;
    cancel: string;
  };
}

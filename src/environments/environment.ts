export const environment = {
  production: true,
  // Relative, so API calls go to the origin the app is served from and the
  // reverse proxy in front of it routes /api to the backend. An absolute URL
  // here would point the *browser* at that host and break both deployment and
  // the same-origin auth-token cookie.
  baseUrl: '',
};

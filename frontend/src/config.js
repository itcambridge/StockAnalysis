const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    // Get the Replit URL
    const hostname = window.location.hostname;
    // Remove the port and dev-specific parts
    const baseHostname = hostname.split('-')[0];
    // Use the main domain without port
    const baseUrl = `https://${baseHostname}.repl.co`;
    console.log('API Base URL:', baseUrl);
    return baseUrl;
  }
  return process.env.REACT_APP_API_URL || '';
};

// Export configuration object directly
export default {
  apiUrl: getBaseUrl()
}; 
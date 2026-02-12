// Test setup file for Jest
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.SESSION_TIMEOUT = '3600';
process.env.MAX_SESSIONS = '100';

// Suppress console output during tests (optional)
// Uncomment if you want to reduce noise
// global.console = {
//     ...console,
//     log: () => {},
//     debug: () => {},
//     info: () => {},
//     warn: () => {},
//     error: () => {}
// };

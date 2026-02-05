import app from './app.js';
import config from '../config/default.js';

const PORT = config.server.port;

app.listen(PORT, () => {
    console.log(`
    🚀 Server is running on port ${PORT}
    ──────────────────────────────────────────
    ► CORS Origin: ${config.server.corsOrigin}
    ► Max Sessions: ${config.session.maxSessions}
    ──────────────────────────────────────────
    `);
});

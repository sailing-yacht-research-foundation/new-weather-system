import express from 'express';

import generalRoutes from './routes/general.route';

export default function createServer() {
  const app = express();

  if (process.env.NODE_ENV !== 'test') {
    app.use(
      require('express-status-monitor')({
        healthChecks: [
          {
            protocol: 'http',
            host: 'localhost',
            path: '/health',
            port: '3000',
          },
        ],
      }),
    );
  }

  app.use(express.json());

  app.use('/', generalRoutes);
  return app;
}

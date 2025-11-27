import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat';
import modelsRouter from './routes/models';
import secretsRouter from './routes/secrets';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/', (req, res) => {
  res.json({
    name: '@unillm-ts/server',
    version: '1.0.0',
    description: 'RESTful API server for unillm-ts',
    endpoints: {
      chat: '/api/chat',
      chatStream: '/api/chat/stream',
      models: '/api/models',
      secrets: '/api/secrets'
    }
  });
});

app.use('/api/chat', chatRouter);
app.use('/api/models', modelsRouter);
app.use('/api/secrets', secretsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API documentation available at http://localhost:${PORT}/`);
});

export default app;

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { exec } from 'child_process';

const app = express();
const PORT = 4000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Allow CORS for local development
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Endpoint to trigger the automation script
app.post('/run-automation', (req: Request, res: Response) => {
  exec('npx ts-node createStripeProducts.ts', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: error.message, stderr });
      return;
    }
    res.json({ output: stdout, stderr });
  });
});

app.listen(PORT, () => {
  console.log(`Automation server running at http://localhost:${PORT}`);
});
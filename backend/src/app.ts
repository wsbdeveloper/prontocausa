import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import authRoutes from './routes/auth';
import caseRoutes from './routes/cases';
import stripeRoutes from './routes/stripe';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/stripe', stripeRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`JustConnect backend running on port ${PORT}`);
});

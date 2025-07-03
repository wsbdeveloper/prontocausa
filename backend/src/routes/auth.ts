import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import express from 'express';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { name, email, password: hashed, role },
    });

    const token = generateToken({ id: user.id, role: user.role });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user.id, role: user.role });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

export default router;

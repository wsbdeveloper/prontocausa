import { PrismaClient, Role } from '@prisma/client';
import express from 'express';
import { authMiddleware } from '../middlewares/auth';

const prisma = new PrismaClient();
const router = express.Router();

// Middleware global
router.use(authMiddleware);

// ✅ Criar um novo caso (usuário comum)
router.post('/', async (req, res) => {
    const { title, description, category, location } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== Role.USER) return res.status(403).json({ message: 'Apenas usuários podem criar casos.' });

    const newCase = await prisma.case.create({
        data: {
            title,
            description,
            category,
            location,
            userId,
        },
    });

    res.status(201).json(newCase);
});

// ✅ Listar casos (advogado ou usuário)
router.get('/', async (req, res) => {
    const role = req.user.role;
    const id = req.user.id;

    if (role === Role.USER) {
        // Usuário vê os próprios casos
        const userCases = await prisma.case.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' } });
        return res.json(userCases);
    }

    // Advogado pode buscar por categoria opcional
    const { category } = req.query;

    const lawyerCases = await prisma.case.findMany({
        where: {
            status: 'OPEN',
            ...(category ? { category: String(category) } : {}),
        },
        orderBy: { createdAt: 'desc' },
    });

    return res.json(lawyerCases);
});

// ✅ Advogado manifesta interesse
router.post('/:id/interesse', async (req, res) => {
    const role = req.user.role;
    const lawyerId = req.user.id;
    const caseId = req.params.id;

    if (role !== Role.LAWYER) return res.status(403).json({ message: 'Apenas advogados podem manifestar interesse.' });

    const updated = await prisma.case.update({
        where: { id: caseId },
        data: {
            lawyerId,
            status: 'IN_PROGRESS',
        },
    });

    res.json(updated);
});

// ✅ Encerrar caso
router.post('/:id/encerrar', async (req, res) => {
    const role = req.user.role;
    const userId = req.user.id;
    const caseId = req.params.id;

    const c = await prisma.case.findUnique({ where: { id: caseId } });
    if (!c) return res.status(404).json({ message: 'Caso não encontrado' });
    if (c.userId !== userId) return res.status(403).json({ message: 'Você não pode encerrar este caso.' });

    const closed = await prisma.case.update({
        where: { id: caseId },
        data: { status: 'CLOSED' },
    });

    res.json(closed);
});

export default router;

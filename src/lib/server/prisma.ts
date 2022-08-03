import Prisma, * as PrismaAll from '@prisma/client';
import { withExclude } from 'prisma-exclude';

const PrismaClient = Prisma?.PrismaClient || PrismaAll?.PrismaClient;

const prisma = withExclude(new PrismaClient());
export default prisma;

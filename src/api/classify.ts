import { FastifyInstance } from 'fastify';
import { evaluateProfile } from '../rules/ruleEngine';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/classify-position', async (request, reply) => {
    const profile = request.body as Record<string, any>;
    const result = evaluateProfile(profile);
    return result;
  });
}

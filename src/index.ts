import Fastify from 'fastify';
import classifyRoutes from './api/classify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import calculationRouters from './api/calculations';

const app = Fastify({ logger: true });

app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
});

app.register(classifyRoutes);
app.register(calculationRouters);

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server listening at ${address}`);
});

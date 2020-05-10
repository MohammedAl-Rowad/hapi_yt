import * as Hapi from '@hapi/hapi';
import { Server, ServerRoute } from '@hapi/hapi';
import { initDb } from './db';
import 'colors';
import { get } from 'node-emoji';
import { userController, postsController, authController } from './controllers';
import { Connection } from 'typeorm';
import { validateJWT, validateBasic } from './auth';

const init = async () => {
  const server: Server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  await server.register(require('hapi-auth-jwt2'));
  await server.register(require('@hapi/basic'));
  const con: Connection = await initDb();

  server.auth.strategy('simple', 'basic', { validate: validateBasic(con) });
  server.auth.strategy('jwt', 'jwt', {
    key: 'getMeFromEnvFile', // Never Share your secret key
    validate: validateJWT(con), // validate function defined above
  });
  console.log(get('dvd'), 'DB init -> Done!'.green, get('dvd'));
  server.route([
    ...userController(con),
    ...postsController(con),
    ...authController(con),
  ] as Array<ServerRoute>);
  await server.start();
  console.log(
    get('rocket'),
    `Server running on ${server.info.uri}`.green,
    get('rocket')
  );
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

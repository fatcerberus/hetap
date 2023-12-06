import { Server } from './server.js';

const APP_NAME = "Hetap";
const APP_COPYRIGHT = "2024 Fat Cerberus";
const APP_VERSION = "0.0.0+";

console.log(`${APP_NAME} ${APP_VERSION} easy-to-use Web server`);
console.log(`a quick-and-dirty file system-based Web server`);
console.log(`(c) ${APP_COPYRIGHT}`);
console.log();

const server = new Server();
server.mount("/", "./");
await server.start(8080, "localhost");

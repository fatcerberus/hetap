import { readFile } from 'node:fs/promises';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Server } from './server.js';

const APP_NAME = "Hetap";
const APP_COPYRIGHT = "2024 Fat Cerberus";
const APP_VERSION = "0.1.0-dev";

printVersion();

const config = await loadConfig();
const options = parseCommandLine();

const hostname = "localhost";
const port = 8080;
console.log(`starting HTTP server...`);
console.log(`   hostname: ${hostname ?? "<any>"}`);
console.log(`   port: ${port}`);
const server = new Server(config.baseConfig)
	.mount('/', config.rootPath);
for (const [ mount, hostPath ] of Object.entries(options.mounts)) {
	const prefix = config.mountPoints[mount];
	server.mount(prefix, path.resolve(hostPath));
}
await server.start(port, hostname);

console.log();

async function loadConfig()
{
	console.log(`reading configuration files...`);
	const userConfig = JSON.parse(await readFile('./hetap.json'));
	const configPath = path.resolve(dirname(fileURLToPath(import.meta.url)), `../configs/${userConfig.uses}.json`);
	const baseConfig = JSON.parse(await readFile(configPath));
	return {
		baseConfig,
		rootPath: path.resolve(userConfig.root),
		mountPoints: userConfig.mountPoints
	};
}

function parseCommandLine()
{
	// TODO: ACTUALLY parse the command line
	return {
		mounts: {
			"game": "C:\\src\\spectacles\\dist"
		}
	};
}

function printVersion(showDeps = false)
{
	console.log(`${APP_NAME} ${APP_VERSION} file-based Web server`);
	console.log(`a lightweight Web server hosted from the file system`);
	console.log(`(c) ${APP_COPYRIGHT}`);
	console.log();
	if (showDeps) {
		console.log(`   Node.js: ${process.version}`);
	}
}

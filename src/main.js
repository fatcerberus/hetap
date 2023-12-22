import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Server } from './server.js';

const APP_NAME = "Hetap";
const APP_COPYRIGHT = "2024 Fat Cerberus";
const APP_VERSION = "0.1.0-dev";

printVersion();

const config = await loadConfiguration();
const options = parseCommandLine();

const hostname = "localhost";
const port = 8080;
console.log(`starting HTTP server...`);
console.log(`   hostname: ${hostname ?? "<any>"}`);
console.log(`   port: ${port}`);
console.log(`   serve: ${config.rootPath}`);
const server = new Server(config.baseConfig)
	.mount('/', config.rootPath);
for (const [ id, hostPath ] of Object.entries(options.hostPaths)) {
	const prefix = config.endpoints[id];
	server.mount(prefix, hostPath);
}
await server.start(port, hostname);

console.log();

async function loadConfiguration()
{
	console.log(`loading configuration...`);
	const userConfig = JSON.parse(await readFile('./hetap.json'));
	const configPath = path.resolve(dirname(fileURLToPath(import.meta.url)), `../configs/${userConfig.uses}.json`);
	const baseConfig = JSON.parse(await readFile(configPath));
	return {
		baseConfig,
		rootPath: path.resolve(userConfig.serveDir),
		endpoints: userConfig.endpoints
	};
}

function parseCommandLine()
{
	console.log("parsing command line...");
	const options = {
		hostPaths: {}
	};
	for (let i = 2; i < process.argv.length; ++i) {
		const token = process.argv[i];
		let parsed;
		if (parsed = token.match(/(\w+)=(.+)/)) {
			const endpointID = parsed[1];
			const hostPath = path.resolve(parsed[2]);
			options.hostPaths[endpointID] = hostPath;
		}
	}
	for (const [ id, hostPath ] of Object.entries(options.hostPaths)) {
		console.log(`   endpoint '${id}' - ${hostPath}`);
	}
	return options;
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

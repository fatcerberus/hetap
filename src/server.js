import { readFile, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

export
class Server
{
	#endpoints = {};
	#indexFileNames;
	#mimeTypes;

	constructor(config)
	{
		this.#indexFileNames = [ ...config.indexFileNames ];
		this.#mimeTypes = { ...config.mimeTypes };
	}

	mount(prefix, hostPath)
	{
		this.#endpoints[prefix] = path.resolve(hostPath);
		return this;
	}

	async start(port = 80, hostname)
	{
		return new Promise((resolve, reject) => {
			http.createServer(this.#serveRequest.bind(this))
				.listen(port, hostname, () => resolve())
		});
	}

	async #serveRequest(request, response)
	{
		const localPath = Object.entries(this.#endpoints)
			.filter(([ prefix, hostPath ]) => request.url.startsWith(prefix))
			.map(([ prefix, hostPath ]) => `${hostPath}/${request.url.slice(prefix.length)}`)
			.at(-1);
		let filePath = path.resolve(localPath);
		let fileContent = null;
		try {
			const stats = await stat(filePath);
			if (stats.isDirectory()) {
				for (const indexFileName of this.#indexFileNames) {
					try {
						filePath = path.resolve(localPath, indexFileName);
						fileContent = await readFile(filePath);
						break;
					}
					catch {
						continue;
					}
				}
			}
			else {
				fileContent = await readFile(filePath);
			}
		}
		catch {
			/* *munch* */
		}
		if (fileContent !== null) {
			const fileExtension = path.extname(filePath);
			const mimeType = this.#mimeTypes[fileExtension] ?? 'application/octet-stream';
			console.log(`200 - '${request.url}' - ${mimeType} - ${filePath}`);
			response.writeHead(200, { 'Content-Type': mimeType });
			response.end(fileContent);
		}
		else {
			console.log(`\x1B[31;1m404 - '${request.url}' - no suitable file available\x1B[m`);
			response.writeHead(404);
			response.end("404: File not found");
		}
	}
}

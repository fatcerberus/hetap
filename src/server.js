import * as FS from 'node:fs/promises';
import HTTP from 'node:http';
import Path from 'node:path';

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
		this.#endpoints[prefix] = Path.resolve(hostPath);
		return this;
	}

	async start(port = 80, hostname = null)
	{
		return await new Promise((resolve, reject) => {
			HTTP.createServer(this.#serveRequest.bind(this))
				.listen(port, hostname ?? undefined, () => resolve())
		});
	}

	async #serveRequest(request, response)
	{
		const localPath = Object.entries(this.#endpoints)
			.filter(([ prefix, hostPath ]) => request.url.startsWith(prefix))
			.map(([ prefix, hostPath ]) => `${hostPath}/${request.url.slice(prefix.length)}`)
			.at(-1);
		let filePath = Path.resolve(localPath);
		let content = null;
		try {
			const stats = await FS.stat(filePath);
			if (stats.isDirectory()) {
				for (const indexFileName of this.#indexFileNames) {
					try {
						filePath = Path.resolve(localPath, indexFileName);
						content = await FS.readFile(filePath);
						break;
					}
					catch {
						continue;
					}
				}
			}
			else {
				content = await FS.readFile(filePath);
			}
		}
		catch {
			/* *munch* */
		}
		if (content !== null) {
			const fileExtension = Path.extname(filePath);
			const mimeType = this.#mimeTypes[fileExtension] ?? 'application/octet-stream';
			console.log(`200 - '${request.url}' - ${mimeType} - ${filePath}`);
			response.writeHead(200, { 'Content-Type': mimeType });
			response.end(content);
		}
		else {
			console.log(`\x1B[31;1m404 - '${request.url}' - no suitable file could be found\x1B[m`);
			response.writeHead(404);
			response.end("404: File not found");
		}
	}
}

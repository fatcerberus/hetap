import * as FS from 'node:fs/promises';
import HTTP from 'node:http';
import Path from 'node:path';

export
class Server
{
	#endpoints = {};
	#indexFileNames = [
		'index.html',
		'index.htm'
	];
	#mimeTypes = {
		".bmp": "image/bmp",
		".css": "text/css",
		".csv": "text/csv",
		".gif": "image/gif",
		".htm": "text/html",
		".html": "text/html",
		".ico": "image/vnd.microsoft.icon",
		".jar": "application/java-archive",
		".jpeg": "image/jpeg",
		".jpg": "image/jpeg",
		".js": "text/javascript",
		".json": "application/json",
		".mjs": "text/javascript",
		".mp3": "audio/mpeg",
		".ogg": "audio/ogg",
		".ogv": "video/ogg",
		".opus": "audio/opus",
		".pdf": "application/pdf",
		".png": "image/png",
		".svg": "image/svg+xml",
		".ttf": "font/ttf",
		".txt": "text/plain",
		".wav": "audio/wav",
		".webp": "image/webp",
		".xml": "application/xml",
		".zip": "application/zip"
	};

	constructor()
	{
	}

	addMIMETypes(extensionMap)
	{
		for (const extension of Object.keys(extensionMap)) {
			this.mimeTypes[extension] = extensionMap[extension];
		}
	}

	mount(prefix, path)
	{
		this.#endpoints[prefix] = Path.resolve(path);
	}

	async start(port = 80, hostname = null)
	{
		return await new Promise((resolve, reject) => {
			const server = HTTP.createServer(this.#serveRequest.bind(this));
			server.listen(port, hostname ?? undefined, () => resolve())
		});
	}

	async #serveRequest(req, res)
	{
		let prefix, localPath;
		for (const endpoint of Object.keys(this.#endpoints)) {
			if (req.url.startsWith(endpoint)) {
				prefix = endpoint;
				localPath = Path.resolve(this.#endpoints[endpoint], req.url.slice(prefix.length));
			}
		}
		let filePath = null;
		let content = null;
		try {
			const stats = await FS.stat(localPath);
			if (stats.isDirectory()) {
				for (const indexFileName of this.#indexFileNames) {
					try {
						content = await FS.readFile(Path.resolve(localPath, indexFileName));
						filePath = Path.resolve(localPath, indexFileName);
						break;
					}
					catch {
						continue;
					}
				}
			}
			else {
				content = await FS.readFile(localPath);
				filePath = localPath;
			}
		}
		catch {
		}
		if (filePath != null) {
			const extension = Path.extname(filePath);
			const mimeType = this.#mimeTypes[extension] ?? 'application/octet-stream';
			console.log(`200 - '${req.url}' - ${mimeType} - ${filePath}`);
			res.writeHead(200, { "Content-Type": mimeType });
			res.end(content);
		}
		else {
			console.log(`\x1B[31;1m404 - '${req.url}' - no suitable file could be found\x1B[m]`);
			res.writeHead(404);
			res.end("404: File not found");
		}
	}
}

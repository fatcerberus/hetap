import { Server } from './server.js';

const APP_NAME = "Hetap";
const APP_COPYRIGHT = "2024 Fat Cerberus";
const APP_VERSION = "0.0.0+";

console.log(`${APP_NAME} ${APP_VERSION} easy-to-use Web server`);
console.log(`a quick-and-dirty file system-based Web server`);
console.log(`(c) ${APP_COPYRIGHT}`);
console.log();

const serverConfig = {
	indexFileNames: [
		"index.html",
		"index.htm"
	],
	mimeTypes: {
		".bmp":  "image/bmp",
		".css":  "text/css",
		".csv":  "text/csv",
		".gif":  "image/gif",
		".htm":  "text/html",
		".html": "text/html",
		".ico":  "image/vnd.microsoft.icon",
		".jar":  "application/java-archive",
		".jpeg": "image/jpeg",
		".jpg":  "image/jpeg",
		".js":   "text/javascript",
		".json": "application/json",
		".mjs":  "text/javascript",
		".mp3":  "audio/mpeg",
		".ogg":  "audio/ogg",
		".ogv":  "video/ogg",
		".opus": "audio/opus",
		".pdf":  "application/pdf",
		".png":  "image/png",
		".svg":  "image/svg+xml",
		".ttf":  "font/ttf",
		".txt":  "text/plain",
		".wav":  "audio/wav",
		".webp": "image/webp",
		".xml":  "application/xml",
		".zip":  "application/zip"
	}
};

await new Server(serverConfig)
	.mount("/", ".\\")
	.mount("/dist", "C:\\src\\spectacles\\dist")
	.start(8080, "localhost");

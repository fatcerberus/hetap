import * as fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

export
class Server
{
    #mimeTypes = {};

    constructor()
    {
    }

    async start(port = 80, hostname = null)
    {
        http.createServer((req, res) => {
            res.writeHead(418, { "Content-Type": "text/plain" });
            res.end("Hello world from Hetap! Hetap is still under construction, so this is all you get for now.");
        }).listen(port, hostname ?? undefined);
    }
}

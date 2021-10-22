/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import path from 'path';
import fetch from 'node-fetch';
import { pipeline } from 'stream';
import { promisify } from 'util';
import dotenv from 'dotenv';
import unzipper from 'unzipper';

const cddaCoreZipUrl = 'https://github.com/CleverRaven/Cataclysm-DDA/archive/refs/heads/master.zip';
const kenanPackZipUrl = 'https://github.com/linonetwo/CDDA-Kenan-Modpack-Chinese/releases/latest/download/Kenan-Modpack-Mod.zip';

const unzipOutputPath = path.join(__dirname, '..', 'data');
const streamPipeline = promisify(pipeline);

dotenv.config();

async function downloadTo(zipUrl, folder) {
  const response = await fetch(zipUrl, { method: 'GET' /* headers: { Authorization: process.env.GITHUB_TOKEN } */ });
  if (!response.ok) throw new Error(`unexpected response when downloading ${zipUrl} ${response.statusText}`);
  await streamPipeline(response.body, unzipper.Extract({ path: folder }));
}
await Promise.all([downloadTo(cddaCoreZipUrl, unzipOutputPath), downloadTo(kenanPackZipUrl, unzipOutputPath)]);

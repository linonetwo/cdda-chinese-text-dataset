/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable unicorn/no-process-exit */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { pipeline } from 'stream';
import { promisify } from 'util';
import dotenv from 'dotenv';
import unzipper from 'unzipper';

import { folderNames } from './paths.mjs';

// see if we have all files already, if so, skip this script to save bandwidth
if ((await Promise.all(folderNames.map((p) => fs.pathExists(p)))).every((r) => r === true)) {
  console.log('All file existed');
  process.exit(0);
}

const cddaCoreZipUrl = 'https://github.com/CleverRaven/Cataclysm-DDA/archive/refs/heads/master.zip';
const kenanPackZipUrl = 'https://github.com/linonetwo/CDDA-Kenan-Modpack-Chinese/releases/latest/download/Kenan-Modpack-Mod.zip';

const streamPipeline = promisify(pipeline);
dotenv.config();

async function downloadTo(zipUrl, folder) {
  const response = await fetch(zipUrl, { method: 'GET' /* headers: { Authorization: process.env.GITHUB_TOKEN } */ });
  if (!response.ok) throw new Error(`unexpected response when downloading ${zipUrl} ${response.statusText}`);
  await streamPipeline(response.body, unzipper.Extract({ path: folder }));
}
await Promise.all([downloadTo(cddaCoreZipUrl, unzipOutputPath), downloadTo(kenanPackZipUrl, unzipOutputPath)]);

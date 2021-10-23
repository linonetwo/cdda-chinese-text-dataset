/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable unicorn/no-process-exit */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import fs from 'fs-extra';
import PO from 'pofile';

import { unzipOutputPath, folderNames, masterPOFilePath, translatedJSONPath } from './paths.mjs';

// see if we have all files already, if so, skip this script to save bandwidth
const filesNeeded = [...folderNames, masterPOFilePath];
if (!(await Promise.all(filesNeeded.map((p) => fs.pathExists(p)))).every((r) => r === true)) {
  console.log(`Some folder don't exist, check ${filesNeeded.join(',')}`);
  process.exit(0);
}
// load translation
const cddaTranslationPair = {};
await new Promise((resolve, reject) => {
  console.log(`Loading PO file ${masterPOFilePath}`);
  PO.load(masterPOFilePath, function (error, po) {
    console.log(`PO file Loaded`);
    if (error) {
      return reject(error);
    }
    po.items.forEach((item) => {
      cddaTranslationPair[item.msgid] = item.msgstr[0];
    });
    resolve();
  });
});
// load mods
const jsonPaths = await globby([`${unzipOutputPath}/Cataclysm-DDA-master/data/json/**/*.json`, `${unzipOutputPath}/Kenan-Modpack-Chinese/**/*.json`]);

const objects = await Promise.all(
  jsonPaths.map((jsonPath) => {
    try {
      return fs.readJson(jsonPath);
    } catch {
      return {};
    }
  }),
);
const hasNameDesc = (object) => {
  const hasName = 'name' in object && !!object.name;
  const hasDescription = 'description' in object && !!object.description;
  return hasName && hasDescription;
};
const JSONObjects = objects.flatMap((objectArray) => {
  if (Array.isArray(objectArray)) {
    return objectArray;
  } else if (typeof objectArray === 'object' && hasNameDesc(objectArray)) {
    return [objectArray];
  }
  return [];
});
const objectsWithNameAndDescription = JSONObjects.filter((element) => hasNameDesc(element));
const formattedObjectsWithNameAndDescription = objectsWithNameAndDescription.map((object) => {
  if (typeof object.name === 'string' && typeof object.description === 'string') {
    return {
      type: object.type,
      name: object.name,
      description: object.description,
    };
  } else if (
    (typeof object.name === 'object' && 'str' in object.name) ||
    'str_sp' in object.name ||
    ('male' in object.name && typeof object.description === 'string')
  ) {
    return {
      type: object.type,
      name: object.name.str || object.name.str_sp || object.name.male,
      description: object.description,
    };
  } else {
    throw new TypeError(`Invalid JSON ${object.description}`);
  }
});
const translatedObjects = formattedObjectsWithNameAndDescription
  .map((object) => ({
    ...object,
    name: cddaTranslationPair[object.name],
    description: cddaTranslationPair[object.description],
  }))
  // exclude those don't have a translation
  .filter((element) => hasNameDesc(element));
await fs.writeJson(translatedJSONPath, translatedObjects);

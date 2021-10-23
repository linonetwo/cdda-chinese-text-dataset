import preval from 'preval.macro';

export interface ICDDAJSONWithNameAndDescription {
  description: string;
  name: string;
  type: string;
}
export const cddaJSONWithNameAndDescription = preval`
const fs = require('fs');
  const path = require('path');
  module.exports = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'translatedNameDesc.json'), 'utf-8'));
` as ICDDAJSONWithNameAndDescription[];

import path from 'path';

export const unzipOutputPath = path.join(__dirname, '..', 'data');

export const folderNames = ['Cataclysm-DDA-master', 'Kenan-Modpack-Chinese'].map((p) => path.join(unzipOutputPath, p));
export const masterPOFilePath = path.join(unzipOutputPath, 'for_use_cataclysm-dda_master-cataclysm-dda_zh_CN.po');
export const translatedJSONPath = path.join(unzipOutputPath, 'translatedNameDesc.json');

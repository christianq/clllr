import fs from 'fs';
import path from 'path';

const GITHUB_USERNAME = 'christianq';
const GITHUB_REPO = 'clllr';
const GITHUB_BRANCH = 'main';

const productPhotosDir = path.resolve(__dirname, '../product-photos');

function getGithubRawUrl(filename: string) {
  return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/${GITHUB_BRANCH}/product-photos/${filename}`;
}

const files = fs.readdirSync(productPhotosDir);
for (const filename of files) {
  if (filename.endsWith('.png')) {
    console.log(getGithubRawUrl(filename));
  }
}
#!/usr/bin/env ts-node

import { exec } from 'child_process';

const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'plotunknown.com';

async function addSubdomain(subdomain: string) {
  const fullDomain = `${subdomain}.${mainDomain}`;
  console.log(`Adding subdomain: ${fullDomain}`);
  exec(`vercel domains add ${fullDomain}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error adding domain: ${stderr}`);
      process.exit(1);
    } else {
      console.log(stdout);
      process.exit(0);
    }
  });
}

const subdomain = process.argv[2];
if (!subdomain) {
  console.error('Usage: ts-node create-subdomain.ts <subdomain>');
  process.exit(1);
}

addSubdomain(subdomain);
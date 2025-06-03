import { exec } from 'child_process';

const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'plotunknown.com';

async function checkSubdomain(subdomain: string) {
  const fullDomain = `${subdomain}.${mainDomain}`;
  exec(`vercel domains ls`, (error, stdout) => {
    if (error) {
      console.error('Error checking domains:', error);
      process.exit(1);
    }
    if (stdout.includes(fullDomain)) {
      console.log('Subdomain is taken.');
      process.exit(1);
    } else {
      console.log('Subdomain is available.');
      process.exit(0);
    }
  });
}

const subdomain = process.argv[2];
if (!subdomain) {
  console.error('Usage: tsx check-subdomain.ts <subdomain>');
  process.exit(1);
}
checkSubdomain(subdomain);
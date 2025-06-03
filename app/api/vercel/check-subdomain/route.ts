import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const { subdomain } = await req.json();
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'plotunknown.com';
  const fullDomain = `${subdomain}.${mainDomain}`;

  try {
    const { stdout } = await execAsync('vercel domains ls');
    if (stdout.includes(fullDomain)) {
      return NextResponse.json({ available: false });
    } else {
      return NextResponse.json({ available: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check subdomain' }, { status: 500 });
  }
}
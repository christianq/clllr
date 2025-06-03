import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const { subdomain } = await req.json();
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'plotunknown.com';
  const fullDomain = `${subdomain}.${mainDomain}`;

  try {
    const { stdout, stderr } = await execAsync(`vercel domains add ${fullDomain}`);
    if (stderr) {
      return NextResponse.json({ error: stderr || 'Failed to add subdomain' }, { status: 500 });
    }
    return NextResponse.json({ success: true, domain: fullDomain, output: stdout });
  } catch (error: any) {
    return NextResponse.json({ error: error?.stderr || error?.message || 'Failed to add subdomain' }, { status: 500 });
  }
}
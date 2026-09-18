import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Direct demo bypass login has been permanently disabled for production security. Please log in using verified credentials.' },
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Endpoint disabled.' },
    { status: 403 }
  );
}

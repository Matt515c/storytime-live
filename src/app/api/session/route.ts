import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ status: 'session_started', timestamp: Date.now() });
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({ status: 'session_stopped', timestamp: Date.now() });
}

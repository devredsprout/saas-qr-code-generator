import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ message: 'Restaurant API ready' }); }
export async function POST(request) { try { const body = await request.json(); return NextResponse.json({ message: 'Restaurant created', data: body }, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }

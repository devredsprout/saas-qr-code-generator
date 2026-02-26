import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ message: 'Products API ready' }); }
export async function POST(request) { try { const body = await request.json(); return NextResponse.json({ message: 'Product endpoint', data: body }, { status: 201 }); } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); } }

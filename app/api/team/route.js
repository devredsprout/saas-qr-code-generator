import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Team API ready',
    endpoints: {
      'POST /api/team': 'Create team',
      'GET /api/team': 'Get current team',
      'POST /api/team/invite': 'Invite member',
      'PUT /api/team/members/:id': 'Update role',
      'DELETE /api/team/members/:id': 'Remove member',
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({ message: 'Team endpoint', data: body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

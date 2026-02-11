import { NextResponse } from 'next/server';

// Placeholder API for restaurant management
// Will be connected to Prisma when restaurant mode is activated

export async function GET() {
  return NextResponse.json({
    message: 'Restaurant API ready',
    endpoints: {
      'POST /api/restaurant': 'Create restaurant',
      'GET /api/restaurant': 'List restaurants',
      'POST /api/restaurant/menu': 'Add menu category',
      'POST /api/restaurant/menu/item': 'Add menu item',
      'GET /api/restaurant/tables': 'Generate table QR codes',
      'GET /api/restaurant/orders': 'List orders',
      'PUT /api/restaurant/orders/:id': 'Update order status',
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    // TODO: Connect to Prisma
    return NextResponse.json({ message: 'Restaurant created', data: body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

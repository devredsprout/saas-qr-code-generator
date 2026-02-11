import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Products API ready',
    endpoints: {
      'POST /api/products': 'Create product',
      'GET /api/products': 'List products',
      'PUT /api/products/:id': 'Update product',
      'POST /api/products/verify': 'Verify serial number',
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({ message: 'Product endpoint', data: body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

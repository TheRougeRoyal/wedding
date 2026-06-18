import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: 'Guest ID is required' },
      { status: 400 }
    );
  }

  // Return success - actual deletion happens in localStorage on the client
  return NextResponse.json({ 
    success: true, 
    message: `Guest ${id} deleted successfully` 
  });
}

export async function GET(request, { params }) {
  const { id } = params;
  return NextResponse.json({ 
    success: true, 
    message: `Guest ${id} endpoint active` 
  });
}

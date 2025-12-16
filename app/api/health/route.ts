import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check - can be enhanced to check DB connection
    return NextResponse.json(
      { 
        status: 'healthy',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Health check failed'
      },
      { status: 503 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ holderId: string }> }
) {
  const { holderId } = await params;
  
  try {
    const result = await pool.query(
      `SELECT firearm_id, serial_number_raw, make, model, calibre, type, action,
              barrel_length_mm, chamber_size_mm, manufacture_year, proof_date,
              condition, notes, transfer_status, created_at, updated_at
       FROM firearms
       WHERE holder_id = $1
       ORDER BY make, model`,
      [holderId]
    );

    return NextResponse.json({ firearms: result.rows });
  } catch (error) {
    console.error('Firearms fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch firearms' }, { status: 500 });
  }
}
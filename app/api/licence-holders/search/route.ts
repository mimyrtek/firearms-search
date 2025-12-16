import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ holders: [] });
  }

  try {
    const result = await pool.query(
      `SELECT holder_id, licence_number_raw, first_name, last_name, 
              full_name, dob, address_line, town, postcode, phone, email,
              licence_type, valid_from, valid_to, created_at, updated_at
       FROM licence_holders
       WHERE full_name ILIKE $1 
          OR first_name ILIKE $1 
          OR last_name ILIKE $1
       ORDER BY full_name
       LIMIT 50`,
      [`%${query}%`]
    );

    return NextResponse.json({ holders: result.rows });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

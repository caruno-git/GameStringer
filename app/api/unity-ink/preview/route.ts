// Route stub per build statico Tauri.
// In modalità desktop l app non chiama mai /api/* (usa Tauri invoke()).
// Il codice originale è preservato in cronologia git (commit prima di questo).
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({ error: 'not_available_in_desktop' }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ error: 'not_available_in_desktop' }, { status: 501 });
}


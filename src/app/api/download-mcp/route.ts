
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Determine the path to the public directory
    // Next.js sets process.cwd() to the root of the project
    const zipPath = path.join(process.cwd(), 'public', 'nexo-mcp.zip');
    
    if (!fs.existsSync(zipPath)) {
      return NextResponse.json({ error: "File not found on server" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(zipPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="nexo-mcp.zip"',
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Internal Server Error while downloading" }, { status: 500 });
  }
}

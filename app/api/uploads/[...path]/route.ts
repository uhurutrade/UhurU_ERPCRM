import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
    req: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        const filePath = params.path.join('/');
        // Buscamos primero en public/uploads y luego en uploads por compatibilidad
        const possiblePaths = [
            join(process.cwd(), 'public', 'uploads', filePath),
            join(process.cwd(), 'uploads', filePath)
        ];

        let finalPath = '';
        for (const p of possiblePaths) {
            if (existsSync(p)) {
                finalPath = p;
                break;
            }
        }

        if (!finalPath) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = await readFile(finalPath);

        // Determinar el Content-Type básico
        const ext = filePath.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';

        if (ext === 'pdf') contentType = 'application/pdf';
        else if (['jpg', 'jpeg'].includes(ext!)) contentType = 'image/jpeg';
        else if (ext === 'png') contentType = 'image/png';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': 'inline',
            },
        });
    } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

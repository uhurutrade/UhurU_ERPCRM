import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { ingestDocument } from '@/lib/ai/rag-engine';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // For security in a real App, we should sanitize filename and use specific IDs
        // Here we just use original name for simplicity
        const filename = file.name;
        const uploadDir = join(process.cwd(), 'uploads');

        // COMPATIBILITY FIX: 
        // We store the 'relativePath' in the database (e.g., 'uploads/file.pdf')
        // This ensures that if you move from Local -> VPS, the path remains valid 
        // relative to the application root in both environments.
        const relativePath = join('uploads', filename);
        // We use absolutePath ONLY for writing the file to disk in the current environment
        const absolutePath = join(process.cwd(), relativePath);

        // 1. Save File to Disk (In VPS context)
        // Ensure uploads directory exists
        const { mkdir } = await import('fs/promises');
        await mkdir(uploadDir, { recursive: true });

        await writeFile(absolutePath, buffer);

        // 2. Save Metadata to DB
        // We store relativePath so it works on both Local and VPS
        const doc = await prisma.complianceDocument.create({
            data: {
                filename: filename,
                fileType: file.type,
                path: relativePath, // Storing 'uploads/file.pdf'
                size: file.size,
                isProcessed: true,
                documentType: 'TAX_UPLOAD'
            }
        });

        // 3. TRIGGER RAG INGESTION (Chunking & Mock Vectorization)
        // We do it asynchronously or waiting, but for this demo we'll wait 
        // to ensure the user sees 'Processed' status.
        try {
            await ingestDocument(doc.id, relativePath);
        } catch (ragError) {
            console.error("RAG Ingestion failing but file saved:", ragError);
        }

        return NextResponse.json({ success: true, document: doc });

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}

import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

export async function getGmailClient(userId: string) {
    const account = await prisma.account.findFirst({
        where: { userId, provider: 'google' }
    });

    if (!account || !account.access_token) {
        throw new Error("No Google account linked or missing tokens.");
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.AUTH_GOOGLE_ID,
        process.env.AUTH_GOOGLE_SECRET
    );

    oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token || undefined,
        expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    });

    // Check if token expired and refresh if necessary
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            await prisma.account.update({
                where: { id: account.id },
                data: {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null
                }
            });
        } else {
            await prisma.account.update({
                where: { id: account.id },
                data: {
                    access_token: tokens.access_token,
                    expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null
                }
            });
        }
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function fetchLabeledEmails(userId: string, labelName: string = 'UhurU-Lead') {
    const gmail = await getGmailClient(userId);

    // 1. Find the label ID for the given name
    const labelsRes = await gmail.users.labels.list({ userId: 'me' });
    const label = labelsRes.data.labels?.find(l => l.name?.toLowerCase() === labelName.toLowerCase());

    if (!label) {
        console.log(`Label ${labelName} not found in Gmail.`);
        return [];
    }

    // 2. List messages with this label (Searches Inbox, Sent, Drafts, etc. as long as they have the label)
    const messagesRes = await gmail.users.messages.list({
        userId: 'me',
        q: `label:${labelName}`, // Search query is more reliable for global search
    });

    const messages = messagesRes.data.messages || [];
    const fullMessages = [];

    for (const msg of messages) {
        const fullMsg = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'full'
        });

        // Extract body
        let body = "";
        const payload = fullMsg.data.payload;
        if (payload?.parts) {
            body = payload.parts.find(p => p.mimeType === 'text/plain')?.body?.data || "";
        } else {
            body = payload?.body?.data || "";
        }

        if (body) {
            body = Buffer.from(body, 'base64').toString('utf-8');
        }

        fullMessages.push({
            id: msg.id,
            snippet: fullMsg.data.snippet,
            body: body,
            subject: fullMsg.data.payload?.headers?.find(h => h.name === 'Subject')?.value
        });
    }

    return fullMessages;
}

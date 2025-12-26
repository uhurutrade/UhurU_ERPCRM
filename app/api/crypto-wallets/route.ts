import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const wallets = await prisma.cryptoWallet.findMany({
            orderBy: { walletName: 'asc' },
        });
        return NextResponse.json(wallets);
    } catch (error) {
        console.error("Error fetching crypto wallets:", error);
        return NextResponse.json(
            { error: "Failed to fetch crypto wallets" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const wallet = await prisma.cryptoWallet.create({
            data: {
                walletName: data.walletName,
                walletType: data.walletType,
                blockchain: data.blockchain,
                network: data.network,
                asset: data.asset,
                assetType: data.assetType,
                contractAddress: data.contractAddress || null,
                walletAddress: data.walletAddress,
                provider: data.provider || null,
                isMultiSig: data.isMultiSig || false,
                requiredSignatures: data.requiredSignatures || null,
                notes: data.notes || null,
            },
        });

        // Trigger RAG Sync (Background)
        const { syncCryptoWallets } = await import('@/lib/ai/auto-sync-rag');
        syncCryptoWallets();

        return NextResponse.json(wallet);
    } catch (error) {
        console.error("Error creating crypto wallet:", error);
        return NextResponse.json(
            { error: "Failed to create crypto wallet" },
            { status: 500 }
        );
    }
}

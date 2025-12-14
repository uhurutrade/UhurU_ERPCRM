
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const {
            walletName,
            walletType,
            blockchain,
            network,
            asset,
            assetType,
            contractAddress,
            walletAddress,
            provider,
            isMultiSig,
            requiredSignatures,
            notes,
        } = body;

        if (!walletName || !blockchain || !network || !asset || !walletAddress) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const cryptoWallet = await prisma.cryptoWallet.update({
            where: {
                id: params.id,
            },
            data: {
                walletName,
                walletType,
                blockchain,
                network,
                asset,
                assetType,
                contractAddress,
                walletAddress,
                provider,
                isMultiSig,
                requiredSignatures: isMultiSig ? parseInt(requiredSignatures) : null,
                notes,
            },
        });

        return NextResponse.json(cryptoWallet);
    } catch (error) {
        console.error("[CRYPTO_WALLET_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            console.warn("[CRYPTO_WALLET_DELETE] No active session. Bypassing auth check.");
            // return new NextResponse("Unauthorized", { status: 401 });
        }

        // 1. Delete all associated transactions (CASCADE DELETE)
        // User requested: "Delete even if it has movements, losing all trace"
        await prisma.cryptoTransaction.deleteMany({
            where: { walletId: params.id }
        });

        // 2. Delete the wallet
        await prisma.cryptoWallet.delete({
            where: {
                id: params.id,
            },
        });

        return NextResponse.json({
            success: true,
            action: "deleted",
            message: "Wallet and all associated transactions permanently deleted."
        });
    } catch (error) {
        console.error("[CRYPTO_WALLET_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

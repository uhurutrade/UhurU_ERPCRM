
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
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 1. Check for transactions
        const transactionCount = await prisma.cryptoTransaction.count({
            where: { walletId: params.id }
        });

        if (transactionCount > 0) {
            // 2. Soft Delete (Archive)
            await prisma.cryptoWallet.update({
                where: { id: params.id },
                data: { isActive: false }
            });

            return NextResponse.json({
                success: true,
                action: "archived",
                message: "Wallet has associated transactions. It has been marked as INACTIVE to preserve financial history."
            });
        }

        // 3. Hard Delete (Safe)
        const cryptoWallet = await prisma.cryptoWallet.delete({
            where: {
                id: params.id,
            },
        });

        return NextResponse.json({
            success: true,
            action: "deleted",
            message: "Wallet deleted successfully."
        });
    } catch (error) {
        console.error("[CRYPTO_WALLET_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

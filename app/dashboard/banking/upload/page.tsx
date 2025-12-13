import { UploadDropzone } from '@/components/banking/upload-dropzone';
import { prisma } from '@/lib/prisma'; // Assuming this exists or I'll need to create it

export default async function BankingUploadPage() {
    // Fetch bank accounts to select from
    // Since we haven't implemented bank account creation yet, 
    // we'll assume there's at least one or handle the empty state.
    // For this MVP, let's fetch the first one or show a "Create Account" placeholder.

    const account = await prisma.bankAccount.findFirst();

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Upload Bank Statement
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Import your transactions from a CSV file. We'll automatically detect duplicates.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                {account ? (
                    <div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Select Bank Account
                            </label>
                            <select className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value={account.id}>
                                    {account.bankName} - {account.currency} ({account.accountNumber || '****'})
                                </option>
                            </select>
                        </div>

                        <UploadDropzone bankAccountId={account.id} />
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Bank Accounts Found</h3>
                        <p className="text-slate-500 mb-4">You need to add a bank account before you can upload statements.</p>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Add Bank Account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

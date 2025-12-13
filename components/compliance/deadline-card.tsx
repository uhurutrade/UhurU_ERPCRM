import { format, differenceInDays } from 'date-fns';
import { getStatusColor } from '@/lib/compliance/uk-tax';

type DeadlineProps = {
    title: string;
    dueDate: Date;
    status: string; // PENDING, COMPLETED, ETC
    amount?: number | null;
    type: string;
};

export function DeadlineCard({ title, dueDate, status, amount, type }: DeadlineProps) {
    const isCompleted = status === 'SUBMITTED' || status === 'PAID';
    const colorClass = getStatusColor(dueDate, isCompleted);
    const daysLeft = differenceInDays(dueDate, new Date());

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{type}</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{title}</h3>
                </div>
                <div className={`w-3 h-3 rounded-full ${colorClass}`} title={isCompleted ? 'Completed' : `${daysLeft} days left`}></div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Due Date</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                        {format(dueDate, 'dd MMM yyyy')}
                    </span>
                </div>

                {amount !== undefined && amount !== null && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Estimated Amount</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)}
                        </span>
                    </div>
                )}

                <div className="pt-2">
                    {isCompleted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            Completed
                        </span>
                    ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${daysLeft < 0
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                            }`}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

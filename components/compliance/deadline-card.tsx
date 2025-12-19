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
        <div className="bg-uhuru-card border border-uhuru-border rounded-2xl p-5 shadow-card hover:bg-uhuru-hover/50 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-[10px] font-bold text-uhuru-text-dim uppercase tracking-widest">{type}</span>
                    <h3 className="text-lg font-bold text-white mt-1 tracking-tight">{title}</h3>
                </div>
                <div className={`w-3 h-3 rounded-full shadow-glow ${colorClass}`} title={isCompleted ? 'Completed' : `${daysLeft} days left`}></div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-uhuru-text-dim">Due Date</span>
                    <span className="font-bold text-white">
                        {format(dueDate, 'dd MMM yyyy')}
                    </span>
                </div>

                {amount !== undefined && amount !== null && (
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-uhuru-text-dim">Estimated Amount</span>
                        <span className="font-bold text-emerald-400">
                            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)}
                        </span>
                    </div>
                )}

                <div className="pt-2">
                    {isCompleted ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Completed
                        </span>
                    ) : (
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${daysLeft < 0
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { toggleTask, deleteTask } from '@/app/actions/crm';
import { Trash2, Loader2, ClipboardList, CheckCircle2, Circle } from 'lucide-react';
import { useConfirm } from '@/components/providers/modal-provider';

interface TaskListProps {
    tasks: any[];
}

export function TaskList({ tasks }: { tasks: any[] }) {
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { confirm } = useConfirm();

    async function handleToggle(id: string, currentStatus: boolean) {
        setProcessingId(id);
        try {
            await toggleTask(id, !currentStatus);
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    }

    async function handleDelete(id: string) {
        const ok = await confirm({
            title: "Delete Task",
            message: "Are you sure you want to delete this task?",
            type: "danger"
        });

        if (ok) {
            await deleteTask(id);
        }
    }

    return (
        <div className="bg-uhuru-card border border-uhuru-border rounded-2xl overflow-hidden shadow-card animate-in fade-in slide-in-from-bottom-4 duration-500">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-uhuru-border text-uhuru-text-muted text-[10px] font-bold uppercase tracking-widest bg-slate-900/30">
                        <th className="py-4 px-6 w-12">Status</th>
                        <th className="py-4 px-6">Task Details</th>
                        <th className="py-4 px-6">Due Date</th>
                        <th className="py-4 px-6">Assigned To</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-uhuru-border">
                    {tasks.map((task) => (
                        <tr key={task.id} className={`hover:bg-slate-800/40 transition-colors group ${task.completed ? 'opacity-50' : ''}`}>
                            <td className="py-4 px-6">
                                <button
                                    onClick={() => handleToggle(task.id, task.completed)}
                                    disabled={processingId === task.id}
                                    className={`transition-all hover:scale-110 ${task.completed ? 'text-emerald-400' : 'text-slate-600 hover:text-white'}`}
                                >
                                    {processingId === task.id ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : task.completed ? (
                                        <CheckCircle2 size={20} />
                                    ) : (
                                        <Circle size={20} />
                                    )}
                                </button>
                            </td>
                            <td className="py-4 px-6">
                                <div className={`font-bold text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                                    {task.title}
                                </div>
                                <div className="text-uhuru-text-dim text-xs mt-0.5">{task.description}</div>
                            </td>
                            <td className="py-4 px-6">
                                <span className={`text-[11px] font-bold ${!task.completed && task.dueDate && new Date(task.dueDate) < new Date()
                                    ? 'text-rose-400'
                                    : 'text-slate-500'
                                    } uppercase`}>
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Deadline'}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-uhuru-text-dim overflow-hidden font-bold">
                                        {task.assignedTo?.name ? task.assignedTo.name.charAt(0) : '?'}
                                    </div>
                                    <span className="text-xs text-white uppercase font-bold tracking-tighter">
                                        {task.assignedTo?.name || 'Unassigned'}
                                    </span>
                                </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                                <button
                                    onClick={() => handleDelete(task.id)}
                                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {tasks.length === 0 && (
                        <tr>
                            <td colSpan={5} className="py-20 text-center">
                                <ClipboardList className="mx-auto mb-4 opacity-10 text-white" size={48} />
                                <p className="text-uhuru-text-dim text-sm italic">All tasks have been cleared! 🚀</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

'use client';

import { Users, Mail, Phone, Building2 } from 'lucide-react';

export function ContactList({ contacts }: { contacts: any[] }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Organization</th>
                        <th className="py-4 px-6">Contact Info</th>
                        <th className="py-4 px-6">Role</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {contacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                                        {contact.name.charAt(0)}
                                    </div>
                                    <div className="font-medium text-slate-900 dark:text-white">{contact.name}</div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                {contact.organization ? (
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                        <Building2 size={14} />
                                        {contact.organization.name}
                                    </div>
                                ) : (
                                    <span className="text-slate-400">-</span>
                                )}
                            </td>
                            <td className="py-4 px-6">
                                <div className="space-y-1">
                                    {contact.email && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Mail size={14} /> {contact.email}
                                        </div>
                                    )}
                                    {contact.phone && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Phone size={14} /> {contact.phone}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-500">
                                {contact.role || '-'}
                            </td>
                        </tr>
                    ))}
                    {contacts.length === 0 && (
                        <tr>
                            <td colSpan={4} className="py-12 text-center text-slate-500">
                                No contacts found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

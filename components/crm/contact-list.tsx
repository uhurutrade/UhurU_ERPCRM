'use client';

import { Users, Mail, Phone, Building2, Trash2 } from 'lucide-react';
import { deleteContact } from '@/app/actions/crm';
import { useState } from 'react';
import { ContactDetailModal } from './modals/contact-detail-modal';
import { useConfirm } from '@/components/providers/modal-provider';

export function ContactList({ contacts, organizations }: { contacts: any[], organizations: any[] }) {
    const [selectedContact, setSelectedContact] = useState<any | null>(null);
    const { confirm } = useConfirm();

    async function handleDelete(e: React.MouseEvent, id: string) {
        e.stopPropagation();
        const ok = await confirm({
            title: "Delete Contact",
            message: "Are you sure you want to delete this contact?",
            type: "danger"
        });

        if (ok) {
            await deleteContact(id);
        }
    }
    return (
        <div className="bg-uhuru-card backdrop-blur-md rounded-2xl border border-uhuru-border overflow-hidden shadow-card">
            <table className="w-full text-left">
                <thead className="bg-slate-900/40">
                    <tr className="border-b border-uhuru-border text-uhuru-text-muted text-[10px] font-bold uppercase tracking-widest">
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6 hidden md:table-cell">Organization</th>
                        <th className="py-4 px-6">Contact Info</th>
                        <th className="py-4 px-6 hidden md:table-cell text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-uhuru-border">
                    {contacts.map((contact) => (
                        <tr
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        >
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-uhuru-text-muted font-bold text-xs border border-slate-700">
                                        {contact.name.charAt(0)}
                                    </div>
                                    <div className="font-bold text-white text-sm">{contact.name}</div>
                                </div>
                            </td>
                            <td className="py-4 px-6 hidden md:table-cell">
                                {contact.organization ? (
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Building2 size={14} className="text-slate-500" />
                                        {contact.organization.name}
                                    </div>
                                ) : (
                                    <span className="text-slate-500 text-xs italic">Independent</span>
                                )}
                            </td>
                            <td className="py-4 px-6">
                                <div className="space-y-1">
                                    {contact.email && (
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Mail size={12} /> {contact.email}
                                        </div>
                                    )}
                                    {contact.phone && (
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Phone size={12} /> {contact.phone}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-800 px-2 py-0.5 rounded mr-2">
                                        {contact.role || 'Contact'}
                                    </span>
                                    <button
                                        onClick={(e) => handleDelete(e, contact.id)}
                                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {contacts.length === 0 && (
                        <tr>
                            <td colSpan={4} className="py-20 text-center text-uhuru-text-dim">
                                <Users className="mx-auto mb-4 opacity-10" size={48} />
                                <p className="text-sm italic">No contacts found in your database.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <ContactDetailModal
                isOpen={!!selectedContact}
                onClose={() => setSelectedContact(null)}
                contact={selectedContact}
                organizations={organizations}
            />
        </div>
    );
}

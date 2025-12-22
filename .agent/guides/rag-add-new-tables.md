# 📘 Guía: Añadir Nuevas Tablas al Sistema RAG

## Cuando crees una nueva tabla/módulo en la aplicación, sigue estos pasos:

---

## 🎯 Paso 1: Crear la función de sincronización

Abre `lib/ai/auto-sync-rag.ts` y añade una nueva función al final del archivo:

```typescript
// ============================================================================
// TU NUEVA SECCIÓN (ejemplo: PROYECTOS)
// ============================================================================

export async function syncProjects() {
    try {
        const projects = await prisma.project.findMany({
            include: { tasks: true, team: true }, // Incluye relaciones si las hay
            orderBy: { createdAt: 'desc' }
        });
        
        let projectContent = "PROJECTS DATABASE\n=================\n\n";
        
        for (const project of projects) {
            projectContent += `Project: ${project.name}\n`;
            projectContent += `Status: ${project.status}\n`;
            projectContent += `Budget: ${project.budget} ${project.currency}\n`;
            projectContent += `Deadline: ${project.deadline?.toISOString().split('T')[0] || 'N/A'}\n`;
            projectContent += `Team Members: ${project.team.length}\n`;
            projectContent += `Tasks: ${project.tasks.length}\n`;
            projectContent += `---\n\n`;
        }
        
        await ingestText('sys_projects', 'Projects Database', projectContent);
        console.log('[RAG Auto-Sync] ✓ Projects');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Projects:', error.message);
    }
}
```

---

## 🎯 Paso 2: Añadir al sync completo

En la misma función `syncAllSystemData()`, añade tu nueva función:

```typescript
export function syncAllSystemData() {
    Promise.resolve().then(async () => {
        try {
            console.log('[RAG Auto-Sync] 🔄 Iniciando sincronización COMPLETA...');

            // ... código existente ...
            
            // AÑADE AQUÍ TU NUEVA FUNCIÓN:
            await syncProjects(); // 👈 Tu nueva tabla
            
            console.log('[RAG Auto-Sync] ✅ Sincronización COMPLETA finalizada');
        } catch (error: any) {
            console.error('[RAG Auto-Sync] ❌ Error:', error.message);
        }
    }).catch(err => console.error('[RAG Auto-Sync] Fatal Error:', err));
}
```

---

## 🎯 Paso 3: Conectar a las acciones del usuario

Cuando el usuario cree/edite/elimine datos de tu nueva tabla, dispara la sincronización:

### Ejemplo en `app/actions/projects.ts`:

```typescript
export async function createProject(formData: FormData) {
    try {
        const project = await prisma.project.create({
            data: { /* ... */ }
        });

        // 🚀 Auto-Sync RAG (Async - No bloqueante)
        try {
            const { syncProjects } = await import('@/lib/ai/auto-sync-rag');
            syncProjects(); // Fire and forget
        } catch (e) { /* Silent fail */ }

        revalidatePath('/dashboard/projects');
        return { success: true, project };
    } catch (error) {
        return { success: false, error: 'Failed to create project' };
    }
}
```

---

## 🎯 Paso 4: Exportar la función (opcional)

Si quieres poder llamar a tu función individualmente desde otros lugares:

En `lib/ai/auto-sync-rag.ts`, asegúrate de que tu función esté exportada:

```typescript
export async function syncProjects() { // 👈 'export' es clave
    // ...
}
```

---

## ✅ Checklist Rápido

Cuando añadas una nueva tabla, verifica:

- [ ] ✅ Creé la función `sync[NombreTabla]()` en `auto-sync-rag.ts`
- [ ] ✅ La añadí a `syncAllSystemData()`
- [ ] ✅ La conecté a las acciones de crear/editar/eliminar
- [ ] ✅ Usé `ingestText()` con un ID único (ej: `sys_projects`)
- [ ] ✅ El contenido es legible y estructurado (no JSON crudo)
- [ ] ✅ Incluí relaciones importantes (con `include`)

---

## 🔍 Ejemplo Completo: Tabla "Expenses"

```typescript
// En auto-sync-rag.ts

export async function syncExpenses() {
    try {
        const expenses = await prisma.expense.findMany({
            include: { category: true, approvedBy: true },
            orderBy: { date: 'desc' },
            take: 100
        });
        
        let expContent = "EXPENSES LOG\n============\n\n";
        
        for (const exp of expenses) {
            expContent += `Date: ${exp.date.toISOString().split('T')[0]}\n`;
            expContent += `Description: ${exp.description}\n`;
            expContent += `Amount: ${exp.amount} ${exp.currency}\n`;
            expContent += `Category: ${exp.category.name}\n`;
            expContent += `Status: ${exp.status}\n`;
            expContent += `Approved By: ${exp.approvedBy?.name || 'Pending'}\n`;
            expContent += `---\n\n`;
        }
        
        await ingestText('sys_expenses', 'Expenses Log', expContent);
        console.log('[RAG Auto-Sync] ✓ Expenses');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Expenses:', error.message);
    }
}

// Añadir a syncAllSystemData():
await syncExpenses();
```

```typescript
// En app/actions/expenses.ts

export async function createExpense(formData: FormData) {
    try {
        const expense = await prisma.expense.create({ /* ... */ });

        // Auto-Sync RAG
        try {
            const { syncExpenses } = await import('@/lib/ai/auto-sync-rag');
            syncExpenses();
        } catch (e) { /* Silent */ }

        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
```

---

## 💡 Tips Pro

1. **Usa `take` para limitar resultados**: No vectorices 10,000 registros, usa `take: 100` o `take: 200`.

2. **Incluye solo lo relevante**: No incluyas campos internos como `createdAt`, `updatedAt` a menos que sean importantes.

3. **Formato legible**: El RAG funciona mejor con texto estructurado que con JSON crudo.

4. **IDs únicos**: Usa prefijo `sys_` para datos del sistema (ej: `sys_expenses`, `sys_projects`).

5. **Silent fail**: Usa `try/catch` sin `console.error` en las acciones para que errores de RAG no afecten al usuario.

---

## 🚀 Resultado

Cada vez que añadas una nueva funcionalidad:
- ✅ El RAG la conocerá automáticamente
- ✅ Se actualizará en tiempo real
- ✅ No ralentizará la aplicación
- ✅ Estará disponible para consultas de la IA

**¡Tu RAG crece con tu aplicación!** 🎉

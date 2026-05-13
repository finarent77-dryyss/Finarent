'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';

/**
 * Kanban columns keyed by DB enum status.
 * Each column maps to one "displayed" status and groups related
 * legacy statuses into a logical column.
 */
const COLUMNS = [
  {
    key: 'PENDING',
    label: 'En attente',
    legacy: 'en_attente',
    borderClass: 'border-slate-400',
    groups: ['en_attente'],
  },
  {
    key: 'REVIEWING',
    label: 'En étude',
    legacy: 'en_cours',
    borderClass: 'border-secondary',
    groups: ['en_cours'],
  },
  {
    key: 'DOCUMENTS_NEEDED',
    label: 'Docs manquants',
    legacy: 'documents_manquants',
    borderClass: 'border-red-500',
    groups: ['documents_manquants'],
  },
  {
    key: 'QUOTE_SENT',
    label: 'Offre émise',
    legacy: 'devis_envoye',
    borderClass: 'border-secondary',
    // Offers issued + accepted + signatures in progress grouped here
    groups: ['devis_envoye', 'devis_accepte', 'signature_en_attente', 'signe', 'transmis'],
  },
  {
    key: 'COMPLETED',
    label: 'Finalisés',
    legacy: 'finalise',
    borderClass: 'border-accent',
    groups: ['finalise', 'validee', 'refusee'],
  },
];

function columnForStatus(status) {
  return COLUMNS.find((c) => c.groups.includes(status))?.key || 'PENDING';
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function KanbanCard({ demande, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: demande.id,
    data: { demande },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-xl border border-slate-200 p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded">
          {demande.reference}
        </span>
        <span className="text-[10px] text-slate-400">{formatDate(demande.createdAt)}</span>
      </div>
      <h3 className="font-bold text-primary text-sm leading-tight mb-1 truncate">
        {demande.companyName}
      </h3>
      <div className="text-xs text-slate-500 truncate mb-2">{demande.email}</div>
      {demande.quoteDetails?.source?.kind === 'simulator' && (
        <div
          className="mb-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700"
          title={`Simulateur : ${demande.quoteDetails.source.label || demande.quoteDetails.source.slug}`}
        >
          <i className="fa-solid fa-wand-magic-sparkles text-[8px]"></i>
          <span className="truncate max-w-[140px]">{demande.quoteDetails.source.label || demande.quoteDetails.source.slug}</span>
        </div>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Montant
        </span>
        <span className="text-sm font-black text-primary">{demande.amount || '-'}</span>
      </div>
    </div>
  );
}

function KanbanColumn({ column, items }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-72 flex-shrink-0 bg-slate-50 rounded-2xl border-t-4 ${column.borderClass} ${
        isOver ? 'ring-2 ring-secondary/30' : ''
      }`}
    >
      <div className="px-4 py-3 border-b border-slate-200 bg-white/60 rounded-t-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-primary uppercase tracking-wider">
            {column.label}
          </h2>
          <span className="text-xs font-bold bg-white text-slate-500 rounded-full px-2 py-0.5 border border-slate-200">
            {items.length}
          </span>
        </div>
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[240px]">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-xs text-slate-400 italic">
            Aucun dossier
          </div>
        ) : (
          items.map((d) => <KanbanCard key={d.id} demande={d} />)
        )}
      </div>
    </div>
  );
}

export default function KanbanClient() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDemande, setActiveDemande] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/demandes');
        if (!res.ok) throw new Error('Chargement impossible');
        setDemandes(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const byColumn = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.key, []]));
    for (const d of demandes) {
      const colKey = columnForStatus(d.status);
      if (map[colKey]) map[colKey].push(d);
    }
    return map;
  }, [demandes]);

  const handleDragStart = (event) => {
    const d = demandes.find((x) => x.id === event.active.id);
    setActiveDemande(d || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveDemande(null);
    if (!over) return;

    const targetCol = COLUMNS.find((c) => c.key === over.id);
    if (!targetCol) return;

    const current = demandes.find((d) => d.id === active.id);
    if (!current) return;

    const currentCol = columnForStatus(current.status);
    if (currentCol === targetCol.key) return;

    const previousStatus = current.status;
    const newStatus = targetCol.legacy;

    // Optimistic update
    setDemandes((prev) =>
      prev.map((d) => (d.id === active.id ? { ...d, status: newStatus } : d)),
    );

    try {
      const res = await fetch(`/api/admin/demandes/${active.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Mise à jour échouée');
      const updated = await res.json();
      setDemandes((prev) => prev.map((d) => (d.id === active.id ? updated : d)));
    } catch (err) {
      // Revert
      setDemandes((prev) =>
        prev.map((d) => (d.id === active.id ? { ...d, status: previousStatus } : d)),
      );
      alert(err.message || 'Erreur lors du changement de statut');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-secondary"></i>
          <span className="text-sm text-slate-400">Chargement du pipeline...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex items-center gap-3 max-w-7xl mx-auto">
        <i className="fa-solid fa-circle-exclamation text-xl"></i>
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">Pipeline Kanban</h1>
          <p className="text-slate-400 text-sm mt-1">
            {demandes.length} dossier{demandes.length > 1 ? 's' : ''} - Glissez pour changer
            de statut
          </p>
        </div>

        {/* Tabs toggle */}
        <div className="inline-flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <Link
            href="/admin/demandes"
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-primary transition-all"
          >
            <i className="fa-solid fa-list text-[10px] mr-1.5"></i>
            Liste
          </Link>
          <span className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-white text-primary shadow-sm">
            <i className="fa-solid fa-table-columns text-[10px] mr-1.5"></i>
            Kanban
          </span>
        </div>
      </div>

      {/* Board */}
      <div className="overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map((col) => (
              <KanbanColumn key={col.key} column={col} items={byColumn[col.key] || []} />
            ))}
          </div>

          <DragOverlay>
            {activeDemande ? (
              <div className="bg-white rounded-xl border border-secondary shadow-xl p-3 w-72">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                    {activeDemande.reference}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDate(activeDemande.createdAt)}
                  </span>
                </div>
                <h3 className="font-bold text-primary text-sm truncate">
                  {activeDemande.companyName}
                </h3>
                <div className="text-xs text-slate-500 truncate">{activeDemande.email}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

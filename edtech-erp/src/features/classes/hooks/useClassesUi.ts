import { useState } from 'react';
import type { ClassItem, SectionItem } from '../services/classes.service';

export type ActiveTab = 'classes' | 'sections' | 'academic-years' | 'promotion';

export function useClassesUi() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('classes');
  const [classFormOpen, setClassFormOpen] = useState(false);
  const [sectionFormOpen, setSectionFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassItem | null>(null);
  const [deletingSection, setDeletingSection] = useState<SectionItem | null>(null);

  return {
    activeTab,
    setActiveTab,
    classFormOpen,
    setClassFormOpen,
    sectionFormOpen,
    setSectionFormOpen,
    editingClass,
    setEditingClass,
    editingSection,
    setEditingSection,
    deletingClass,
    setDeletingClass,
    deletingSection,
    setDeletingSection,
  };
}

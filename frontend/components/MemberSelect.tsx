import React, { useState, useRef, useEffect } from 'react';
import { AssigneeType } from '../types';

interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

interface MemberSelectProps {
  members: Member[];
  selectedId: string;
  onChange: (id: string) => void;
  placeholder?: string;
  loading?: boolean;
  allowUnassigned?: boolean;
  unassignedLabel?: string;
  className?: string;
  assigneeType?: string;
  onAssigneeTypeChange?: (type: string) => void;
}


const MemberSelect: React.FC<MemberSelectProps> = ({
  members,
  selectedId,
  onChange,
  placeholder = 'Selecionar membro...',
  loading = false,
  allowUnassigned = true,
  unassignedLabel = 'Sem responsável',

  className = '',
  assigneeType,
  onAssigneeTypeChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedMember = members.find(m => m.id === selectedId);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`}></div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800/50"
      >
        {selectedMember ? (
          <>
            <img
              src={selectedMember.avatarUrl || `https://ui-avatars.com/api/?name=${selectedMember.name}&background=random`}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
              alt={selectedMember.name}
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate block">
                {selectedMember.name}
              </span>
              {selectedMember.role && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedMember.role}
                  {assigneeType && (
                     <span 
                       className="ml-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase cursor-pointer hover:bg-primary/20"
                       onClick={(e) => {
                         e.stopPropagation();
                         const types = Object.values(AssigneeType);
                         const currentIndex = types.indexOf(assigneeType as AssigneeType);
                         const nextType = types[(currentIndex + 1) % types.length];
                         onAssigneeTypeChange?.(nextType);
                       }}
                       title="Clique para alterar função"
                     >
                       {assigneeType}
                     </span>
                  )}
                </span>
              )}
            </div>
          </>
        ) : selectedId === '' && !allowUnassigned ? (
          <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
        ) : selectedId === '' ? (
          <>
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xs">
              ?
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{unassignedLabel}</span>
          </>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
        )}
        <span className={`material-icons ml-auto text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
            {/* Unassigned Option */}
            {allowUnassigned && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors group ${
                  selectedId === '' 
                    ? 'bg-primary/10 dark:bg-primary/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                    selectedId === '' 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark'
                  }`}>
                    {selectedId === '' && (
                      <span className="material-icons text-white text-[14px]">check</span>
                    )}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xs ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-gray-700 transition-all">
                  ?
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{unassignedLabel}</span>
              </button>
            )}

            {/* Members List */}
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleSelect(member.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors group ${
                  selectedId === member.id 
                    ? 'bg-primary/10 dark:bg-primary/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                    selectedId === member.id 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark'
                  }`}>
                    {selectedId === member.id && (
                      <span className="material-icons text-white text-[14px]">check</span>
                    )}
                  </div>
                </div>
                <img
                  src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-gray-700 transition-all"
                  alt={member.name}
                />
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate block">
                    {member.name}
                  </span>
                  {member.role && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">{member.role}</span>
                  )}
                  {assigneeType === 'IMPLEMENTER' && (
                     <span className="ml-auto text-[10px] font-bold text-gray-400 uppercase">Implementador</span>
                  )}
                  {assigneeType === 'CREATOR' && (
                     <span className="ml-auto text-[10px] font-bold text-gray-400 uppercase">Criador</span>
                  )}
                  {assigneeType === 'REVIEWER' && (
                     <span className="ml-auto text-[10px] font-bold text-gray-400 uppercase">Revisor</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberSelect;

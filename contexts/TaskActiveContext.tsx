import React, { createContext, useContext, useState } from 'react';
import type { Task } from '@/types/task.types';

interface TaskActiveContextProps {
  activeTask: Task | null;
  setActiveTask: (task: Task | null) => void;
}

const TaskActiveContext = createContext<TaskActiveContextProps | undefined>(undefined);

export const TaskActiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  return (
    <TaskActiveContext.Provider value={{ activeTask, setActiveTask }}>
      {children}
    </TaskActiveContext.Provider>
  );
};

export const useTaskActive = () => {
  const context = useContext(TaskActiveContext);
  if (!context) throw new Error('useTaskActive debe usarse dentro de TaskActiveProvider');
  return context;
};

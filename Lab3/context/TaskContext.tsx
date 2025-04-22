import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

type TaskType = 'count' | 'boolean' | 'value' | 'duration';

interface Task {
  id: string;
  description: string;
  completed: boolean;
  type: TaskType; // Type of task for progress display
  targetValue?: number; // Target count or score or duration
}

interface TaskContextType {
  tasks: Task[];
  updateTaskCompletion: (taskId: string, completed: boolean) => void;
  // Progress values
  singleClickCount: number;
  doubleClickCount: number;
  score: number;
  holdDuration: number; // ms
  didDrag: boolean;
  didSwipeLeft: boolean;
  didSwipeRight: boolean;
  didPinch: boolean;
  // Functions to update progress from MainScreen
  incrementSingleClick: () => void;
  incrementDoubleClick: () => void;
  setScore: (newScore: number) => void;
  setHoldDuration: (duration: number) => void;
  setDidDrag: (value: boolean) => void;
  setDidSwipeLeft: (value: boolean) => void;
  setDidSwipeRight: (value: boolean) => void;
  setDidPinch: (value: boolean) => void;
  resetProgress?: () => void; // Optional: Might be useful for testing/replayability
}

const initialTasks: Task[] = [
  { id: '1', description: 'Make 10 single clicks', completed: false, type: 'count', targetValue: 10 },
  { id: '2', description: 'Make 5 double clicks', completed: false, type: 'count', targetValue: 5 },
  { id: '3', description: 'Hold the object for 3 seconds', completed: false, type: 'duration', targetValue: 3000 }, // 3000ms
  { id: '4', description: 'Drag the object', completed: false, type: 'boolean' },
  { id: '5', description: 'Swipe right', completed: false, type: 'boolean' },
  { id: '6', description: 'Swipe left', completed: false, type: 'boolean' },
  { id: '7', description: 'Change object size (pinch)', completed: false, type: 'boolean' },
  { id: '8', description: 'Get 100 points', completed: false, type: 'value', targetValue: 100 },
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  // Lifted progress state
  const [singleClickCount, setSingleClickCount] = useState(0);
  const [doubleClickCount, setDoubleClickCount] = useState(0);
  const [score, setScoreState] = useState(0); // Renamed internal state setter
  const [holdDuration, setHoldDuration] = useState(0);
  const [didDrag, setDidDrag] = useState(false);
  const [didSwipeLeft, setDidSwipeLeft] = useState(false);
  const [didSwipeRight, setDidSwipeRight] = useState(false);
  const [didPinch, setDidPinch] = useState(false);

  const updateTaskCompletion = useCallback((taskId: string, completed: boolean) => {
    setTasks(currentTasks => {
       const task = currentTasks.find(t => t.id === taskId);
       // Only update if status is different
       if (task && task.completed !== completed) {
         console.log(`Task ${taskId} marked as ${completed ? 'completed' : 'pending'}`);
         return currentTasks.map(t =>
           t.id === taskId ? { ...t, completed: completed } : t
         );
       }
       return currentTasks; // Return unchanged array if no update needed
     });
  }, []);

  // Updater functions for progress state
  const incrementSingleClick = useCallback(() => setSingleClickCount(c => c + 1), []);
  const incrementDoubleClick = useCallback(() => setDoubleClickCount(c => c + 1), []);
  const setScore = useCallback((newScore: number) => setScoreState(newScore), []);
  const setHoldDurationInternal = useCallback((duration: number) => setHoldDuration(duration), []);
  const setDidDragInternal = useCallback((value: boolean) => setDidDrag(value), []);
  const setDidSwipeLeftInternal = useCallback((value: boolean) => setDidSwipeLeft(value), []);
  const setDidSwipeRightInternal = useCallback((value: boolean) => setDidSwipeRight(value), []);
  const setDidPinchInternal = useCallback((value: boolean) => setDidPinch(value), []);

  // Example reset function
  const resetProgress = () => {
      setTasks(initialTasks);
      setSingleClickCount(0);
      setDoubleClickCount(0);
      setScoreState(0);
      setHoldDuration(0);
      setDidDrag(false);
      setDidSwipeLeft(false);
      setDidSwipeRight(false);
      setDidPinch(false);
      console.log("Progress Reset");
  }

  const contextValue: TaskContextType = {
    tasks,
    updateTaskCompletion,
    singleClickCount,
    doubleClickCount,
    score,
    holdDuration,
    didDrag,
    didSwipeLeft,
    didSwipeRight,
    didPinch,
    incrementSingleClick,
    incrementDoubleClick,
    setScore,
    setHoldDuration: setHoldDurationInternal,
    setDidDrag: setDidDragInternal,
    setDidSwipeLeft: setDidSwipeLeftInternal,
    setDidSwipeRight: setDidSwipeRightInternal,
    setDidPinch: setDidPinchInternal,
    resetProgress
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
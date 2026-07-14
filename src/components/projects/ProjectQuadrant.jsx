import React from 'react';

export default function ProjectQuadrant({ tasks = [] }) {
  // REQUIREMENT: Ensure archived/deleted tasks are excluded from quadrant counts
  const activeTasks = tasks.filter(t => !t.isArchived && t.status !== 'DELETED');

  // Helper to count tasks and check for focus items
  const getQuadData = (quadNum) => {
    // Treat quadrant 4 and unassigned (null/undefined) as the same bucket
    const quadTasks = activeTasks.filter(t => 
      quadNum === 4 ? (t.quadrant === 4 || !t.quadrant) : t.quadrant === quadNum
    );
    
    // REQUIREMENT: Dark green if 1+ tasks in that quadrant is a focus item for the week
    const hasFocus = quadTasks.some(t => t.isWeeklyFocus);
    
    return {
      count: quadTasks.length,
      colorClass: hasFocus ? "bg-green-800 text-white font-bold" : "bg-muted/30 text-muted-foreground"
    };
  };

  const q1 = getQuadData(1);
  const q2 = getQuadData(2);
  const q3 = getQuadData(3);
  const q4 = getQuadData(4);

  return (
    <div className="grid grid-cols-2 gap-0.5 border border-border rounded overflow-hidden w-9 h-9 text-[10px]">
      <div className={`flex items-center justify-center ${q1.colorClass}`}>{q1.count}</div>
      <div className={`flex items-center justify-center ${q2.colorClass}`}>{q2.count}</div>
      <div className={`flex items-center justify-center ${q3.colorClass}`}>{q3.count}</div>
      <div className={`flex items-center justify-center ${q4.colorClass}`}>{q4.count}</div>
    </div>
  );
}

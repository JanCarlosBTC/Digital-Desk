import React from 'react';
import { BasicTrees } from './basic-trees';

interface ProblemTreesProps {
  showNewProblemTree?: boolean;
  onDialogClose?: () => void;
}

export function NewProblemTrees({ 
  showNewProblemTree = false, 
  onDialogClose 
}: ProblemTreesProps) {
  return (
    <BasicTrees
      showNewProblemTree={showNewProblemTree}
      onDialogClose={onDialogClose}
    />
  );
}
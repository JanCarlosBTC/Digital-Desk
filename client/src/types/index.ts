export interface BaseItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Decision extends BaseItem {
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  date: Date;
  tags: string[];
  notes?: string;
}

export interface Offer extends BaseItem {
  title: string;
  description: string;
  price: number;
  status: 'active' | 'sold' | 'archived';
  category: string;
  images: string[];
  notes?: string;
}

export interface Reflection extends BaseItem {
  type: 'weekly' | 'monthly';
  content: string;
  date: Date;
  mood: number;
  tags: string[];
}

export interface ClarityItem extends BaseItem {
  title: string;
  content: string;
  category: 'goals' | 'values' | 'vision';
  priority: number;
  status: 'active' | 'completed' | 'archived';
}

export interface ThinkingDeskItem extends BaseItem {
  title: string;
  content: string;
  category: 'ideas' | 'tasks' | 'notes';
  priority: number;
  status: 'active' | 'completed' | 'archived';
  dueDate?: Date;
} 
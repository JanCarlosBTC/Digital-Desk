/**
 * Virtualized List Component
 * 
 * A reusable component for efficiently rendering large lists using virtualization.
 * This helps reduce memory usage and improve performance when displaying many items.
 */

import React, { useRef, useCallback, ReactNode, CSSProperties } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';

// Types
export interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  itemClassName?: string;
  containerHeight?: number | string;
  getItemKey?: (index: number) => string | number;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  emptyComponent?: ReactNode;
  loadingComponent?: ReactNode;
  isLoading?: boolean;
  scrollToIndex?: number;
  onScroll?: (scrollOffset: number) => void;
  itemPadding?: string;
}

/**
 * Component for efficiently rendering large lists using virtualization
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  estimateSize = 50,
  overscan = 5,
  className = '',
  itemClassName = '',
  containerHeight = 400,
  getItemKey,
  onEndReached,
  endReachedThreshold = 0.8,
  emptyComponent,
  loadingComponent,
  isLoading = false,
  scrollToIndex,
  onScroll,
  itemPadding = 'px-2 py-1',
}: VirtualizedListProps<T>) {
  // Create a reference to the parent container for the virtualizer
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Create the virtualizer instance
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey,
  });
  
  // Handle scroll to check if we've reached the end
  const handleScroll = useCallback(() => {
    if (!onEndReached || isLoading) return;
    
    const scrollElement = parentRef.current;
    if (!scrollElement) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    
    if (scrollPercentage > endReachedThreshold) {
      onEndReached();
    }
    
    if (onScroll) {
      onScroll(scrollTop);
    }
  }, [onEndReached, isLoading, endReachedThreshold, onScroll]);
  
  // Scroll to a specific item if needed
  React.useEffect(() => {
    if (scrollToIndex !== undefined && scrollToIndex >= 0 && scrollToIndex < items.length) {
      virtualizer.scrollToIndex(scrollToIndex, { align: 'center' });
    }
  }, [scrollToIndex, virtualizer, items.length]);
  
  // Handle the case where there are no items
  if (items.length === 0 && !isLoading) {
    return <>{emptyComponent}</> || null;
  }
  
  // Handle loading state
  if (isLoading && items.length === 0) {
    return <>{loadingComponent}</> || null;
  }
  
  // Get the virtual items to render
  const virtualItems = virtualizer.getVirtualItems();
  
  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{
        height: containerHeight,
        width: '100%',
      }}
      onScroll={handleScroll}
    >
      {/* Total height container */}
      <div
        className="relative w-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {/* Individual virtualized items */}
        {virtualItems.map((virtualItem: VirtualItem<unknown>) => {
          const item = items[virtualItem.index];
          
          // Skip rendering if item is undefined
          if (item === undefined) return null;
          
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              className={`absolute top-0 left-0 w-full ${itemClassName} ${itemPadding}`}
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
      
      {/* Loading at the bottom */}
      {isLoading && items.length > 0 && loadingComponent}
    </div>
  );
}

/**
 * Grid version of virtualized list for card layouts
 */
export function VirtualizedGrid<T>({
  items,
  renderItem,
  columns = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
  },
  gap = 16,
  estimateSize = 250,
  containerHeight = 400,
  ...rest
}: VirtualizedListProps<T> & {
  columns?: { default: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
}) {
  const [numColumns, setNumColumns] = React.useState(columns.default);
  
  // Update columns based on screen size
  React.useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setNumColumns(columns.default);
      } else if (width < 768) {
        setNumColumns(columns.sm || columns.default);
      } else if (width < 1024) {
        setNumColumns(columns.md || columns.sm || columns.default);
      } else if (width < 1280) {
        setNumColumns(columns.lg || columns.md || columns.sm || columns.default);
      } else {
        setNumColumns(columns.xl || columns.lg || columns.md || columns.sm || columns.default);
      }
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [columns]);
  
  // Custom rendering for grid layout
  const renderGridItem = useCallback((item: T, index: number) => {
    const itemStyle: CSSProperties = {
      width: `calc(${100 / numColumns}% - ${(numColumns - 1) * gap / numColumns}px)`,
      marginRight: (index + 1) % numColumns === 0 ? 0 : gap,
    };
    
    return (
      <div style={itemStyle} className="inline-block align-top h-full">
        {renderItem(item, index)}
      </div>
    );
  }, [renderItem, numColumns, gap]);
  
  return (
    <VirtualizedList
      {...rest}
      items={items}
      renderItem={renderGridItem}
      estimateSize={estimateSize}
      containerHeight={containerHeight}
      className="px-2"
      itemPadding="py-2"
    />
  );
}

export default {
  VirtualizedList,
  VirtualizedGrid,
}; 
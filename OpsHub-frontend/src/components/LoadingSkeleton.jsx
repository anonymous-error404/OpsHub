import React from 'react';

export const SkeletonLine = ({ width = '100%', height = '14px', style = {} }) => (
  <div className="skeleton" style={{ width, height, ...style }} />
);

export const SkeletonCard = ({ height = '140px' }) => (
  <div className="skeleton" style={{ height, borderRadius: 'var(--radius-lg)' }} />
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4" style={{ padding: 'var(--space-4)' }}>
    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <SkeletonLine width="60%" style={{ marginBottom: 'var(--space-2)' }} />
      <SkeletonLine width="40%" height="10px" />
    </div>
    <SkeletonLine width="80px" />
  </div>
);

export const StatCardSkeleton = () => (
  <div className="glass-card">
    <div className="flex items-center justify-between mb-4">
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)' }} />
      <SkeletonLine width="52px" height="20px" />
    </div>
    <SkeletonLine width="50%" height="12px" style={{ marginBottom: 'var(--space-2)' }} />
    <SkeletonLine width="70%" height="28px" />
  </div>
);

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'stat') {
    return items.map((i) => <StatCardSkeleton key={i} />);
  }
  if (type === 'row') {
    return items.map((i) => <SkeletonRow key={i} />);
  }
  return items.map((i) => <SkeletonCard key={i} />);
};

export default LoadingSkeleton;

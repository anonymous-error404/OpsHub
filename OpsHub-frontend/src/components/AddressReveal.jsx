import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

const AddressReveal = ({ address, className = "", prefix = "" }) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!address) return <span className="text-secondary">—</span>;
  
  const isFullAddress = address.length > 20;
  const truncated = isFullAddress ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.span
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`font-mono cursor-pointer transition-colors group ${className}`}
      animate={{ color: isHovered ? 'var(--primary-light)' : 'inherit' }}
      style={{ 
        wordBreak: isHovered ? 'break-all' : 'normal',
        whiteSpace: 'normal',
        display: 'inline',
        verticalAlign: 'baseline'
      }}
      onClick={handleCopy}
    >
      {prefix}{isFullAddress && !isHovered ? truncated : address}
      
      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex ml-1 items-center justify-center bg-white/10 p-0.5 rounded hover:bg-white/20"
            style={{ verticalAlign: 'text-bottom' }}
            onClick={handleCopy}
          >
            {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
};

export default AddressReveal;

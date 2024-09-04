import React from 'react';
import Link from 'next/link';

const Button = ({
  href,
  onClick,
  children,
  className = '',
  type = 'button',
}) => {
  const baseClasses =
    'inline-block px-4 py-2 text-white transition-colors border rounded-md border-white/50 hover:bg-white/50 active:bg-white active:text-black hover:text-black';
  const combinedClasses = `${baseClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={combinedClasses}>
      {children}
    </button>
  );
};

export default Button;

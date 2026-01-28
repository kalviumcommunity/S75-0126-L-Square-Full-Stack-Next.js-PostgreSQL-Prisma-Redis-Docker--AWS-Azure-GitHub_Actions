import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

const Card = ({ children, title, className = '', ...props }: CardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`} {...props}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;

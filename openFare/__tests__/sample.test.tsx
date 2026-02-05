import { render, screen } from '@testing-library/react';
import Button from '../src/components/ui/Button';

describe('Sample Tests', () => {
  it('should render button with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should have correct variant classes', () => {
    render(<Button variant="primary">Submit</Button>);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toHaveClass('bg-blue-600');
  });
});
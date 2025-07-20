export function generateNextPageTestTemplate(pageName: string): string {
  return `import { render, screen } from '@testing-library/react';
import ${pageName.charAt(0).toUpperCase() + pageName.slice(1)} from '../page';

describe('${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page', () => {
  it('renders without crashing', () => {
    render(<${pageName.charAt(0).toUpperCase() + pageName.slice(1)} />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('displays the correct title', () => {
    render(<${pageName.charAt(0).toUpperCase() + pageName.slice(1)} />);
    expect(screen.getByText('${
      pageName.charAt(0).toUpperCase() + pageName.slice(1)
    }')).toBeInTheDocument();
  });
});
`;
}
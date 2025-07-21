export function generateNextPageTestTemplate(pageName: string): string {
  return `import ${
    pageName.charAt(0).toUpperCase() + pageName.slice(1)
  } from '../page';

describe('${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page', () => {
  it('should render without crashing', () => {
    // Add your test implementation here
  });
});
`;
}

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

export function generateDynamicRouteTestTemplate(
  pageName: string,
  dynamicSegment: string,
  isCatchAll: boolean = false
): string {
  const capitalizedName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
  const segmentName = dynamicSegment.replace(/[\[\]]/g, ""); // Remove brackets
  const isCatchAllSegment = isCatchAll || segmentName.startsWith("...");
  const cleanSegmentName = isCatchAllSegment
    ? segmentName.replace("...", "")
    : segmentName;

  return `import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import ${capitalizedName} from '../page';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('${capitalizedName} Page', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      query: { ${cleanSegmentName}: ${
    isCatchAllSegment ? '["test", "value"]' : '"test-value"'
  }' },
      // Add other router properties as needed for your tests
    } as any);
  });

  it('should render without crashing', () => {
    render(<${capitalizedName} />);
    expect(screen.getByText('${capitalizedName}')).toBeInTheDocument();
  });

  it('should display the ${cleanSegmentName} parameter', () => {
    render(<${capitalizedName} />);
    ${
      isCatchAllSegment
        ? `expect(screen.getByText(/test\/value/)).toBeInTheDocument();`
        : `expect(screen.getByText(/test-value/)).toBeInTheDocument();`
    }
  });
});
`;
}

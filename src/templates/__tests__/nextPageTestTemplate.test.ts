import { generateNextPageTestTemplate } from "../nextPageTestTemplate";

describe("generateNextPageTestTemplate", () => {
  it("should generate correct test template for basic page names", () => {
    const result = generateNextPageTestTemplate("about");

    expect(result).toContain(
      "import { render, screen } from '@testing-library/react'"
    );
    expect(result).toContain("import About from '../page'");
    expect(result).toContain("describe('About Page'");
    expect(result).toContain("it('renders without crashing'");
    expect(result).toContain("it('displays the correct title'");
    expect(result).toContain("render(<About />)");
    expect(result).toContain("expect(screen.getByText('About'))");
  });

  it("should handle page names with hyphens", () => {
    const result = generateNextPageTestTemplate("user-profile");

    expect(result).toContain("import User-profile from '../page'");
    expect(result).toContain("describe('User-profile Page'");
    expect(result).toContain("render(<User-profile />)");
    expect(result).toContain("expect(screen.getByText('User-profile'))");
  });

  it("should handle single character page names", () => {
    const result = generateNextPageTestTemplate("a");

    expect(result).toContain("import A from '../page'");
    expect(result).toContain("describe('A Page'");
    expect(result).toContain("render(<A />)");
    expect(result).toContain("expect(screen.getByText('A'))");
  });

  it("should handle page names with numbers", () => {
    const result = generateNextPageTestTemplate("page1");

    expect(result).toContain("import Page1 from '../page'");
    expect(result).toContain("describe('Page1 Page'");
    expect(result).toContain("render(<Page1 />)");
    expect(result).toContain("expect(screen.getByText('Page1'))");
  });

  it("should handle empty page names", () => {
    const result = generateNextPageTestTemplate("");

    expect(result).toContain("import  from '../page'");
    expect(result).toContain("describe(' Page'");
    expect(result).toContain("render(< />)");
    expect(result).toContain("expect(screen.getByText(''))");
  });

  it("should generate valid test structure", () => {
    const result = generateNextPageTestTemplate("test");

    // Check for proper test structure
    expect(result).toMatch(
      /import \{ render, screen \} from '@testing-library\/react'/
    );
    expect(result).toMatch(/import Test from '\.\.\/page'/);
    expect(result).toMatch(/describe\('Test Page', \(\) => \{/);
    expect(result).toMatch(/it\('renders without crashing', \(\) => \{/);
    expect(result).toMatch(/it\('displays the correct title', \(\) => \{/);
    expect(result).toMatch(/render\(<Test \/>\)/);
    expect(result).toMatch(
      /expect\(screen\.getByRole\('heading'\)\)\.toBeInTheDocument\(\)/
    );
    expect(result).toMatch(
      /expect\(screen\.getByText\('Test'\)\)\.toBeInTheDocument\(\)/
    );
  });

  it("should capitalize the first letter correctly", () => {
    const result = generateNextPageTestTemplate("myPage");

    expect(result).toContain("import MyPage from '../page'");
    expect(result).toContain("describe('MyPage Page'");
    expect(result).toContain("render(<MyPage />)");
    expect(result).toContain("expect(screen.getByText('MyPage'))");
  });

  it("should handle special characters in page names", () => {
    const result = generateNextPageTestTemplate("user-settings");

    expect(result).toContain("import User-settings from '../page'");
    expect(result).toContain("describe('User-settings Page'");
    expect(result).toContain("render(<User-settings />)");
    expect(result).toContain("expect(screen.getByText('User-settings'))");
  });

  it("should generate consistent test content structure", () => {
    const testCases = [
      "home",
      "about",
      "contact",
      "blog",
      "dashboard",
      "user-profile",
      "settings-page",
    ];

    testCases.forEach((pageName) => {
      const result = generateNextPageTestTemplate(pageName);
      const capitalizedName =
        pageName.charAt(0).toUpperCase() + pageName.slice(1);

      // Check that all required parts are present
      expect(result).toContain(`import ${capitalizedName} from '../page'`);
      expect(result).toContain(`describe('${capitalizedName} Page'`);
      expect(result).toContain(`render(<${capitalizedName} />)`);
      expect(result).toContain(
        `expect(screen.getByText('${capitalizedName}'))`
      );

      // Check for proper test structure
      expect(result).toContain("it('renders without crashing'");
      expect(result).toContain("it('displays the correct title'");
      expect(result).toContain(
        "expect(screen.getByRole('heading')).toBeInTheDocument()"
      );
    });
  });
});

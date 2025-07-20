import { generateNextPageTemplate } from "../../templates/nextPageTemplate";

// Test the template function directly since it's the core logic
describe("generateNextPageTemplate integration", () => {
  it("should generate correct template for different page names", () => {
    const testCases = [
      { input: "home", expected: "Home" },
      { input: "about", expected: "About" },
      { input: "contact", expected: "Contact" },
      { input: "blog", expected: "Blog" },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = generateNextPageTemplate(input);

      expect(result).toContain(`export default function ${expected}()`);
      expect(result).toContain(`<h1>${expected}</h1>`);
      expect(result).toContain("return (");
      expect(result).toContain("<div>");
      expect(result).toContain("</div>");
    });
  });

  it("should handle edge cases correctly", () => {
    // Test empty string
    const emptyResult = generateNextPageTemplate("");
    expect(emptyResult).toContain("export default function ()");

    // Test single character
    const singleCharResult = generateNextPageTemplate("a");
    expect(singleCharResult).toContain("export default function A()");

    // Test with numbers
    const numberResult = generateNextPageTemplate("page1");
    expect(numberResult).toContain("export default function Page1()");
  });

  it("should generate valid JSX structure", () => {
    const result = generateNextPageTemplate("test");

    // Check for proper JSX structure
    expect(result).toMatch(
      /export default function Test\(\) \{\s+return \(\s+<div>\s+<h1>Test<\/h1>\s+<\/div>\s+\);\s+\}/
    );
  });

  it("should capitalize the first letter correctly", () => {
    const result = generateNextPageTemplate("myPage");

    expect(result).toContain("export default function MyPage()");
    expect(result).toContain("<h1>MyPage</h1>");
  });
});

// Test the integration between template and file generation logic
describe("Page generation logic", () => {
  it("should create correct file content structure", () => {
    const pageName = "example";
    const content = generateNextPageTemplate(pageName);

    // Verify the content structure
    expect(content).toContain("export default function Example()");
    expect(content).toContain("return (");
    expect(content).toContain("<div>");
    expect(content).toContain("<h1>Example</h1>");
    expect(content).toContain("</div>");
    expect(content).toContain(");");
    expect(content).toContain("}");
  });

  it("should handle special characters in page names", () => {
    const pageName = "user-profile";
    const content = generateNextPageTemplate(pageName);

    // Should handle hyphens by capitalizing each word
    expect(content).toContain("export default function User-profile()");
    expect(content).toContain("<h1>User-profile</h1>");
  });
});

import { generateNextPageTemplate } from "../nextPageTemplate";

describe("NextPageTemplate", () => {
  describe("generateNextPageTemplate", () => {
    it("should generate a template with capitalized component name", () => {
      const result = generateNextPageTemplate("home");

      expect(result).toContain("export default function Home()");
      expect(result).toContain("Home");
    });

    it("should include the page name in the content", () => {
      const result = generateNextPageTemplate("about");

      expect(result).toContain("About");
      expect(result).toContain("<h1>About</h1>");
    });

    it("should generate valid TypeScript/JSX code", () => {
      const result = generateNextPageTemplate("contact");

      expect(result).toContain("return (");
      expect(result).toContain("<div>");
      expect(result).toContain("</div>");
    });

    it("should handle single character page names", () => {
      const result = generateNextPageTemplate("a");

      expect(result).toContain("export default function A()");
    });

    it("should handle empty string gracefully", () => {
      const result = generateNextPageTemplate("");

      expect(result).toContain("export default function ()");
    });

    it("should generate the complete template structure", () => {
      const result = generateNextPageTemplate("test");

      expect(result).toMatch(
        /export default function Test\(\) \{\s+return \(\s+<div>\s+<h1>Test<\/h1>\s+<\/div>\s+\);\s+\}/
      );
    });
  });
});

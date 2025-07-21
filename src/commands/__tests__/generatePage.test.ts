import { generateNextPageTemplate } from "../../templates/nextPageTemplate";

// Mock the modules before importing the function
const mockMkdir = jest.fn();
const mockWriteFile = jest.fn();
const mockExistsSync = jest.fn();
const mockJoin = jest.fn();

// Mock the modules
jest.mock("fs", () => ({
  existsSync: mockExistsSync,
  promises: {
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
  },
}));

jest.mock("path", () => ({
  join: mockJoin,
}));

// Mock the template functions
jest.mock("../../templates/nextPageTemplate", () => ({
  generateNextPageTemplate: jest.fn(
    (name: string) =>
      `export default function ${
        name.charAt(0).toUpperCase() + name.slice(1)
      }() { return <div><h1>${
        name.charAt(0).toUpperCase() + name.slice(1)
      }</h1></div>; }`
  ),
}));

jest.mock("../../templates/nextPageTestTemplate", () => ({
  generateNextPageTestTemplate: jest.fn(
    (name: string) =>
      `import { render, screen } from '@testing-library/react'; import ${
        name.charAt(0).toUpperCase() + name.slice(1)
      } from '../page'; describe('${
        name.charAt(0).toUpperCase() + name.slice(1)
      } Page', () => { it('renders without crashing', () => { render(<${
        name.charAt(0).toUpperCase() + name.slice(1)
      } />); expect(screen.getByRole('heading')).toBeInTheDocument(); }); it('displays the correct title', () => { render(<${
        name.charAt(0).toUpperCase() + name.slice(1)
      } />); expect(screen.getByText('${
        name.charAt(0).toUpperCase() + name.slice(1)
      }')).toBeInTheDocument(); }); });`
  ),
}));

// Import after mocking
import { generatePage } from "../generatePage";

// Mock console methods
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();
const mockProcessExit = jest.spyOn(process, "exit").mockImplementation(() => {
  throw new Error("process.exit called");
});
const mockProcessCwd = jest
  .spyOn(process, "cwd")
  .mockImplementation(() => "/mock/cwd");

describe("generatePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
    mockJoin.mockImplementation((...args: string[]) => args.join("/"));
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockProcessExit.mockRestore();
    mockProcessCwd.mockRestore();
  });

  describe("Basic page generation", () => {
    it("should generate a basic page without additional folders", async () => {
      await generatePage("about");

      expect(mockMkdir).toHaveBeenCalledWith("/mock/cwd/src/app/about", {
        recursive: true,
      });
      expect(mockWriteFile).toHaveBeenCalledWith(
        "/mock/cwd/src/app/about/page.tsx",
        expect.any(String),
        { flag: "wx" }
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "Created page: /mock/cwd/src/app/about/page.tsx"
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "Page 'about' scaffold created!"
      );
    });

    it("should exit if page already exists", async () => {
      mockExistsSync.mockReturnValue(true);

      await expect(generatePage("existing-page")).rejects.toThrow(
        "process.exit called"
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Page 'existing-page' already exists at /mock/cwd/src/app/existing-page"
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it("should handle file write errors", async () => {
      const error = new Error("File write error");
      mockWriteFile.mockRejectedValue(error);

      await expect(generatePage("error-page")).rejects.toThrow(
        "process.exit called"
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error generating page scaffold:",
        "File write error"
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });

  describe("Component folder generation", () => {
    it("should generate component folder when withComponent is true", async () => {
      await generatePage("dashboard", { withComponent: true });

      // Check that component folder was created
      expect(mockMkdir).toHaveBeenCalledWith(
        "/mock/cwd/src/app/dashboard/components",
        {
          recursive: true,
        }
      );

      // Check that index file was created
      expect(mockWriteFile).toHaveBeenCalledWith(
        "/mock/cwd/src/app/dashboard/components/index.ts",
        expect.stringContaining("// Components for dashboard page")
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "Created components folder: /mock/cwd/src/app/dashboard/components"
      );
    });

    it("should not generate component folder when withComponent is false", async () => {
      await generatePage("simple-page", { withComponent: false });

      // Should not create component folder
      expect(mockMkdir).not.toHaveBeenCalledWith(
        expect.stringContaining("components"),
        expect.any(Object)
      );
    });

    it("should not generate component folder by default", async () => {
      await generatePage("default-page");

      // Should not create component folder
      expect(mockMkdir).not.toHaveBeenCalledWith(
        expect.stringContaining("components"),
        expect.any(Object)
      );
    });
  });

  describe("Test folder generation", () => {
    it("should generate test folder when withTest is true", async () => {
      await generatePage("blog", { withTest: true });

      // Check that test folder was created
      expect(mockMkdir).toHaveBeenCalledWith(
        "/mock/cwd/src/app/blog/__tests__",
        {
          recursive: true,
        }
      );

      // Check that test file was created
      expect(mockWriteFile).toHaveBeenCalledWith(
        "/mock/cwd/src/app/blog/__tests__/page.test.tsx",
        expect.stringContaining("describe('Blog Page'")
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "Created test folder: /mock/cwd/src/app/blog/__tests__"
      );
    });

    it("should generate correct test content", async () => {
      await generatePage("user-profile", { withTest: true });

      const testFileCall = mockWriteFile.mock.calls.find(
        (call: any) =>
          call[0] === "/mock/cwd/src/app/user-profile/__tests__/page.test.tsx"
      );

      expect(testFileCall).toBeDefined();
      const testContent = testFileCall![1] as string;

      expect(testContent).toContain(
        "import { render, screen } from '@testing-library/react'"
      );
      expect(testContent).toContain("import User-profile from '../page'");
      expect(testContent).toContain("describe('User-profile Page'");
      expect(testContent).toContain("it('renders without crashing'");
      expect(testContent).toContain("it('displays the correct title'");
    });

    it("should not generate test folder when withTest is false", async () => {
      await generatePage("simple-page", { withTest: false });

      // Should not create test folder
      expect(mockMkdir).not.toHaveBeenCalledWith(
        expect.stringContaining("__tests__"),
        expect.any(Object)
      );
    });

    it("should not generate test folder by default", async () => {
      await generatePage("default-page");

      // Should not create test folder
      expect(mockMkdir).not.toHaveBeenCalledWith(
        expect.stringContaining("__tests__"),
        expect.any(Object)
      );
    });
  });

  describe("Combined functionality", () => {
    it("should generate both component and test folders when both flags are true", async () => {
      await generatePage("dashboard", {
        withComponent: true,
        withTest: true,
      });

      // Check component folder creation
      expect(mockMkdir).toHaveBeenCalledWith(
        "/mock/cwd/src/app/dashboard/components",
        {
          recursive: true,
        }
      );

      // Check test folder creation
      expect(mockMkdir).toHaveBeenCalledWith(
        "/mock/cwd/src/app/dashboard/__tests__",
        {
          recursive: true,
        }
      );

      // Check component index file
      expect(mockWriteFile).toHaveBeenCalledWith(
        "/mock/cwd/src/app/dashboard/components/index.ts",
        expect.stringContaining("// Components for dashboard page")
      );

      // Check test file
      expect(mockWriteFile).toHaveBeenCalledWith(
        "/mock/cwd/src/app/dashboard/__tests__/page.test.tsx",
        expect.stringContaining("describe('Dashboard Page'")
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "Created components folder: /mock/cwd/src/app/dashboard/components"
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "Created test folder: /mock/cwd/src/app/dashboard/__tests__"
      );
    });

    it("should handle errors in component folder creation", async () => {
      const error = new Error("Component folder error");
      mockMkdir
        .mockResolvedValueOnce(undefined) // Page directory
        .mockRejectedValueOnce(error); // Component directory

      try {
        await generatePage("error-page", { withComponent: true });
        // If we reach here, the function completed successfully
        throw new Error("Expected function to throw an error");
      } catch (err: any) {
        // The error should be from process.exit mock
        expect(err.message).toBe("process.exit called");
      }

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error generating page scaffold:",
        "Component folder error"
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });

  describe("Page name handling", () => {
    it("should handle page names with hyphens", async () => {
      await generatePage("user-profile", { withTest: true });

      const testFileCall = mockWriteFile.mock.calls.find(
        (call: any) =>
          call[0] === "/mock/cwd/src/app/user-profile/__tests__/page.test.tsx"
      );

      expect(testFileCall).toBeDefined();
      const testContent = testFileCall![1] as string;

      expect(testContent).toContain("import User-profile from '../page'");
      expect(testContent).toContain("describe('User-profile Page'");
    });

    it("should handle single character page names", async () => {
      await generatePage("a", { withTest: true });

      const testFileCall = mockWriteFile.mock.calls.find(
        (call: any) => call[0] === "/mock/cwd/src/app/a/__tests__/page.test.tsx"
      );

      expect(testFileCall).toBeDefined();
      const testContent = testFileCall![1] as string;

      expect(testContent).toContain("import A from '../page'");
      expect(testContent).toContain("describe('A Page'");
    });

    it("should handle page names with numbers", async () => {
      await generatePage("page1", { withTest: true });

      const testFileCall = mockWriteFile.mock.calls.find(
        (call: any) =>
          call[0] === "/mock/cwd/src/app/page1/__tests__/page.test.tsx"
      );

      expect(testFileCall).toBeDefined();
      const testContent = testFileCall![1] as string;

      expect(testContent).toContain("import Page1 from '../page'");
      expect(testContent).toContain("describe('Page1 Page'");
    });

    it("should handle subfolder type names", async () => {
      await generatePage("cars/car", { withTest: true });

      // Check that the full directory structure is created
      expect(mockMkdir).toHaveBeenCalledWith("/mock/cwd/src/app/cars/car", {
        recursive: true,
      });

      // Check that the page file is created in the correct location
      expect(mockWriteFile).toHaveBeenCalledWith(
        "/mock/cwd/src/app/cars/car/page.tsx",
        expect.any(String),
        { flag: "wx" }
      );

      // Check that the test folder is created in the correct location
      expect(mockMkdir).toHaveBeenCalledWith(
        "/mock/cwd/src/app/cars/car/__tests__",
        {
          recursive: true,
        }
      );

      // Check that the test file uses the extracted page name (last part of path)
      const testFileCall = mockWriteFile.mock.calls.find(
        (call: any) =>
          call[0] === "/mock/cwd/src/app/cars/car/__tests__/page.test.tsx"
      );

      expect(testFileCall).toBeDefined();
      const testContent = testFileCall![1] as string;

      expect(testContent).toContain("import Car from '../page'");
      expect(testContent).toContain("describe('Car Page'");
    });

    it("should handle nested subfolder type names", async () => {
      await generatePage("admin/users/profile", {
        withComponent: true,
        withTest: true,
      });

      // Check that the full directory structure is created
      expect(mockMkdir).toHaveBeenCalledWith(
        "/mock/cwd/src/app/admin/users/profile",
        {
          recursive: true,
        }
      );

      // Check that the page file is created in the correct location
      expect(mockWriteFile).toHaveBeenCalledWith(
        "/mock/cwd/src/app/admin/users/profile/page.tsx",
        expect.any(String),
        { flag: "wx" }
      );

      // Check that component folder is created with correct page name
      expect(mockMkdir).toHaveBeenCalledWith(
        "/mock/cwd/src/app/admin/users/profile/components",
        {
          recursive: true,
        }
      );

      expect(mockWriteFile).toHaveBeenCalledWith(
        "/mock/cwd/src/app/admin/users/profile/components/index.ts",
        expect.stringContaining("// Components for profile page")
      );

      // Check that test folder is created with correct page name
      expect(mockMkdir).toHaveBeenCalledWith(
        "/mock/cwd/src/app/admin/users/profile/__tests__",
        {
          recursive: true,
        }
      );

      const testFileCall = mockWriteFile.mock.calls.find(
        (call: any) =>
          call[0] ===
          "/mock/cwd/src/app/admin/users/profile/__tests__/page.test.tsx"
      );

      expect(testFileCall).toBeDefined();
      const testContent = testFileCall![1] as string;

      expect(testContent).toContain("import Profile from '../page'");
      expect(testContent).toContain("describe('Profile Page'");
    });

    it("should handle subfolder names with special characters", async () => {
      await generatePage("blog/posts/my-post", { withTest: true });

      // Check that the full directory structure is created
      expect(mockMkdir).toHaveBeenCalledWith(
        "/mock/cwd/src/app/blog/posts/my-post",
        {
          recursive: true,
        }
      );

      // Check that the test file uses the extracted page name
      const testFileCall = mockWriteFile.mock.calls.find(
        (call: any) =>
          call[0] ===
          "/mock/cwd/src/app/blog/posts/my-post/__tests__/page.test.tsx"
      );

      expect(testFileCall).toBeDefined();
      const testContent = testFileCall![1] as string;

      expect(testContent).toContain("import My-post from '../page'");
      expect(testContent).toContain("describe('My-post Page'");
    });
  });
});

export function generateNextPageTemplate(pageName: string): string {
  const capitalizedName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return `export default function ${capitalizedName}() {
  return (
    <div>
      <h1>${capitalizedName}</h1>
    </div>
  );
}`;
}
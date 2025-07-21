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

export function generateDynamicRouteTemplate(
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

  return `import { useRouter } from 'next/router';

export default function ${capitalizedName}() {
  const router = useRouter();
  ${
    isCatchAllSegment
      ? `const ${cleanSegmentName} = router.query.${cleanSegmentName} as string[];`
      : `const ${cleanSegmentName} = router.query.${cleanSegmentName} as string;`
  }

  return (
    <div>
      <h1>${capitalizedName}</h1>
      ${
        isCatchAllSegment
          ? `<p>${cleanSegmentName}: {Array.isArray(${cleanSegmentName}) ? ${cleanSegmentName}.join('/') : ${cleanSegmentName}}</p>`
          : `<p>${cleanSegmentName}: {${cleanSegmentName}}</p>`
      }
    </div>
  );
}`;
}

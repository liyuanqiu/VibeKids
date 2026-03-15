/**
 * Runtime engine: manages injecting AI-generated code into a sandboxed iframe.
 * Handles error reporting from the iframe via postMessage.
 */

const PRELOADED_LIBS = `
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/p5.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/15.1.22/Tone.min.js"></script>
`;

/**
 * Build a full HTML document from generated code.
 * The generated code from AI is expected to be a complete HTML page,
 * but we wrap it with error reporting and preloaded libs.
 */
export function buildIframeHTML(code: string): string {
  // If the AI already gave a full HTML doc, inject our error handler
  if (code.trim().toLowerCase().startsWith("<!doctype") || code.trim().toLowerCase().startsWith("<html")) {
    // Inject error handler before </head> or at start of <body>
    const errorScript = getErrorHandlerScript();
    const libScript = PRELOADED_LIBS;

    let html = code;
    // Inject libs before closing head tag
    if (html.includes("</head>")) {
      html = html.replace("</head>", `${libScript}\n${errorScript}\n</head>`);
    } else if (html.includes("<body")) {
      html = html.replace("<body", `${libScript}\n${errorScript}\n<body`);
    }
    return html;
  }

  // Otherwise wrap in a full HTML document
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow: hidden; background: #1a1a2e; }
    canvas { display: block; }
  </style>
  ${PRELOADED_LIBS}
  ${getErrorHandlerScript()}
</head>
<body>
${code}
</body>
</html>`;
}

function getErrorHandlerScript(): string {
  return `<script>
    window.onerror = function(msg, url, line, col, error) {
      window.parent.postMessage({
        type: 'VIBEKID_ERROR',
        error: { message: String(msg), line: line, col: col, stack: error ? error.stack : '' }
      }, '*');
      return true;
    };
    window.addEventListener('unhandledrejection', function(e) {
      window.parent.postMessage({
        type: 'VIBEKID_ERROR',
        error: { message: String(e.reason), line: 0, col: 0, stack: '' }
      }, '*');
    });
    // Report successful load
    window.addEventListener('load', function() {
      window.parent.postMessage({ type: 'VIBEKID_LOADED' }, '*');
    });
  </script>`;
}

/** Create a blob URL from HTML content for use in iframe src */
export function createBlobURL(html: string): string {
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}

/** Revoke a previously created blob URL to free memory */
export function revokeBlobURL(url: string): void {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

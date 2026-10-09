export async function bootstrapApp(): Promise<void> {
  if (typeof document !== "undefined") {
    const rootHtml = document.documentElement;
    if (!rootHtml.getAttribute("lang")) {
      rootHtml.setAttribute("lang", "en-IN");
    }
    if (!rootHtml.getAttribute("data-glass")) {
      rootHtml.setAttribute("data-glass", "on");
    }
  }
}

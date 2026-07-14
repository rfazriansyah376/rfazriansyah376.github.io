export async function onRequest(context) {
  const response = await context.next();

  // Hanya proses HTML
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  // Jika bukan Singapura, kirim apa adanya
  const country = context.request.cf?.country || "";
  if (country !== "SG") {
    return response;
  }

  // Ambil HTML
  let html = await response.text();

  // Hapus semua elemen dengan class ads-no-sg
  html = html.replace(
    /<div\s+class=["'][^"']*\bads-no-sg\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
  );

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

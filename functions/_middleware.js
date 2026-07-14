export async function onRequest(context) {
  const response = await context.next();

  const country = context.request.cf?.country || "";

  // Jangan ubah selain HTML
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  // Jika bukan Singapura, kirim apa adanya
  if (country !== "SG") {
    return response;
  }

  // Untuk pengunjung Singapura, hapus script JuicyAds
  let html = await response.text();

  html = html.replace(
    /<!-- JuicyAds PopUnders v3 Start -->[\s\S]*?<!-- JuicyAds PopUnders v3 End -->/g,
    ""
  );

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

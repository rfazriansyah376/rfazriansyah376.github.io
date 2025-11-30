// /assets/js/related-posts.js
function loadRelatedPosts(label) {

  const maxResults = 150;
  const container = document.getElementById("related-post");
  let startIndex = 1;
  let loaded = 0;

  function clearGallery() {
    container.innerHTML = "";
    loaded = 0;
  }

  function extractImageFromContent(content) {
    let div = document.createElement("div");
    div.innerHTML = content;
    let imgTag = div.querySelector("img");
    return imgTag ? imgTag.src.replace(/=s72-c/, "=s1600") : null;
  }

  function extractSnippet(content) {
    let div = document.createElement("div");
    div.innerHTML = content;
    let pTag = div.querySelector("p");
    return pTag ? pTag.outerHTML : "";
  }

  function handleReindrinse(blogId, data) {
    if (data?.feed?.entry) {
      data.feed.entry.forEach(entry => {
        let title = entry.title.$t;
        let link = entry.link.find(l => l.rel === "alternate").href;
        let blogDomain = "";
        try { blogDomain = new URL(link).origin; } catch(e) {}

        let labels = entry.category ?
          entry.category.map(cat => `<a href="${blogDomain}/search/label/${encodeURIComponent(cat.term)}" target="_blank">${cat.term}</a>`)
          : [];

        let thumb = entry.content ? extractImageFromContent(entry.content.$t) : null;
        if (!thumb && entry.media$thumbnail) thumb = entry.media$thumbnail.url.replace(/=s72-c/, "=s1600");
        if (!thumb) thumb = "https://via.placeholder.com/1280x720?text=No+Image";

        let snippet = entry.content ? extractSnippet(entry.content.$t) : "";

        let item = document.createElement("div");
        item.className = "related-item";
        item.innerHTML = `
          <h3 class="post-title"><a href="${link}" target="_blank">${title}</a></h3>
          ${snippet ? `<div class="post-snippet">${snippet}</div>` : ""}
          ${labels.length ? `<p class="spo">${labels.join(", ")}</p>` : ""}
        `;
        container.appendChild(item);
      });
    }
    loaded++;
    if (loaded === blogIds.length && container.innerHTML === "") {
      container.innerHTML = "<p>No More Post</p>";
    }
  }

  function loadPosts() {
    clearGallery();
    blogIds.forEach(blogId => {
      let script = document.createElement("script");
      script.src = `https://www.blogger.com/feeds/${blogId}/posts/default/-/${encodeURIComponent(label)}?alt=json-in-script&max-results=${maxResults}&start-index=${startIndex}&callback=handle${blogId}`;
      window["handle"+blogId] = (data) => handleReindrinse(blogId, data);
      document.body.appendChild(script);
    });
  }

  loadPosts();
}

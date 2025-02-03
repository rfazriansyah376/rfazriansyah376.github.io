function rak_info_Load(data) {
    let entries = data.feed.entry;
    let gallery = document.getElementById("gallery");
    let randomPosts = [];

    while (randomPosts.length < 10 && entries.length > 0) {
        let randomIndex = Math.floor(Math.random() * entries.length);
        let randomPost = entries.splice(randomIndex, 1)[0];
        randomPosts.push(randomPost);
    }

    randomPosts.forEach(entry => {
        let mediaContent = entry.media$thumbnail ? entry.media$thumbnail.url : entry.content.$t.match(/<img.*?src=["'](.*?)["']/)?.[1];
        let postUrl = entry.link.find(link => link.rel === "alternate").href;
        let postTitle = entry.title.$t;

        if (mediaContent && postUrl && postTitle) {
            let photoContainer = document.createElement("div");
            photoContainer.className = "photo-container";

            let link = document.createElement("a");
            link.href = postUrl;
            link.target = "_blank";

            let img = document.createElement("img");
            img.dataset.src = mediaContent.replace(/\/s72-c/, "/s600");
            img.loading = "lazy";
            img.alt = postTitle;

            let title = document.createElement("h3");
            title.className = "photo-title";
            title.textContent = postTitle;

            link.appendChild(img);
            photoContainer.appendChild(link);
            photoContainer.appendChild(title);
            gallery.appendChild(photoContainer);
        }
    });

    lazyLoadImages();
}

function lazyLoadImages() {
    let images = document.querySelectorAll(".photo-container img");

    let observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let img = entry.target;
                img.src = img.dataset.src;
                img.classList.add("loaded");
                observer.unobserve(img);
            }
        });
    }, { rootMargin: "100px" });

    images.forEach(img => observer.observe(img));
}

document.addEventListener("DOMContentLoaded", () => {
    let script = document.createElement("script");
    script.src = "/feeds/posts/default/?start-index=1&max-results=9999&alt=json-in-script&callback=rak_info_Load";
    document.body.appendChild(script);
});

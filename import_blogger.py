import requests
import json
import os
from datetime import datetime

# URL Feed Blogger
BLOGGER_FEED_URL = "https://www.xcelebgram.my.id/feeds/posts/default?alt=json&max-results=9999"

# Ambil data JSON dari Blogger
response = requests.get(BLOGGER_FEED_URL)
data = response.json()

# Folder untuk menyimpan postingan
output_dir = "_posts"
os.makedirs(output_dir, exist_ok=True)

for entry in data["feed"]["entry"]:
    title = entry["title"]["$t"]
    content = entry["content"]["$t"]
    published = entry["published"]["$t"]
    
    # Ambil kategori/tags jika ada
    categories = [cat["term"] for cat in entry.get("category", [])]
    
    # Format tanggal untuk Jekyll (YYYY-MM-DD)
    date_obj = datetime.strptime(published[:10], "%Y-%m-%d")
    
    # Membuat slug dari judul
    slug = title.lower().replace(" ", "-").replace("?", "").replace(":", "").replace("/", "").replace("&", "and")
    
    # Nama file format: 2025-02-13-judul-postingan.html
    filename = f"{output_dir}/{date_obj.strftime('%Y-%m-%d')}-{slug}.html"
    
    # Menentukan gambar (default ke image.png jika tidak ada)
    image_url = "image.png"
    
    # Buat YAML Front Matter dan HTML konten
    html_content = f"""---
layout: xp
title: "{title}"
author: admin
categories: {', '.join([f'"{category}"' for category in categories])}
image: "{image_url}"
---
{content}
"""

    # Simpan ke file
    with open(filename, "w", encoding="utf-8") as file:
        file.write(html_content)

print(f"Postingan dari www.xcelebgram.my.id berhasil diekspor ke folder {output_dir}")

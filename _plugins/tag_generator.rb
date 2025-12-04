module Jekyll
  class TagPage < Page
    def initialize(site, base, dir, tag, posts)
      @site = site
      @base = base
      @dir = dir
      @name = 'index.html'
      
      self.process(@name)
      
      # Gunakan layout khusus untuk halaman tag
      if site.layouts.key?('tag')
        self.read_yaml(File.join(base, '_layouts'), 'tag.html')
      else
        # Fallback jika layout tag tidak ada
        self.read_yaml(File.join(base, '_layouts'), 'default.html')
      end
      
      self.data['title'] = "Tag: #{tag}"
      self.data['tag'] = tag
      self.data['slug'] = tag.downcase.gsub(' ', '-')
      self.data['posts'] = posts
      self.data['layout'] = 'tag'
      
      # Tambahkan meta description
      self.data['description'] = "Halaman untuk tag #{tag}. Total ada #{posts.size} postingan dengan tag ini."
    end
  end
  
  class TagIndexPage < Page
    def initialize(site, base, dir)
      @site = site
      @base = base
      @dir = dir
      @name = 'index.html'
      
      self.process(@name)
      
      # Gunakan layout default atau custom
      if site.layouts.key?('tag-index')
        self.read_yaml(File.join(base, '_layouts'), 'tag-index.html')
      elsif site.layouts.key?('default')
        self.read_yaml(File.join(base, '_layouts'), 'default.html')
      else
        self.data = {}
      end
      
      self.data['title'] = 'Daftar Semua Tag'
      self.data['layout'] = site.layouts.key?('tag-index') ? 'tag-index' : 'default'
      self.data['all_tags'] = site.tags
      self.data['description'] = "Daftar semua tag yang ada di blog ini. Total ada #{site.tags.size} tag."
    end
  end
  
  class TagGenerator < Generator
    safe true
    priority :low
    
    def generate(site)
      # 1. Buat halaman index untuk semua tag
      tags_dir = site.config['tags_dir'] || 'tag'
      index_page = TagIndexPage.new(site, site.source, tags_dir)
      site.pages << index_page
      
      # 2. Buat halaman untuk setiap tag
      site.tags.each do |tag, posts|
        # Normalize tag name untuk URL
        tag_slug = tag.downcase.gsub(' ', '-').gsub(/[^a-z0-9\-]/, '')
        
        # Buat halaman tag
        tag_page = TagPage.new(site, site.source, 
                              File.join(tags_dir, tag_slug), 
                              tag, posts)
        site.pages << tag_page
      end
    end
  end
end

-- Create table for storing generated landing pages
CREATE TABLE IF NOT EXISTS landings (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(255) NOT NULL UNIQUE,
    theme VARCHAR(500) NOT NULL,
    geo VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table for blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    landing_id INTEGER REFERENCES landings(id),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(landing_id, slug)
);

-- Create table for form submissions
CREATE TABLE IF NOT EXISTS form_submissions (
    id SERIAL PRIMARY KEY,
    landing_id INTEGER REFERENCES landings(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_landings_domain ON landings(domain);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(landing_id, slug);
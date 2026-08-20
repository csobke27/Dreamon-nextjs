import { render, screen } from '@testing-library/react';

import BlogCard from './blog-card.component';

describe('BlogCard', () => {
  it('renders a blog post link and sanitizes title access for WordPress objects', () => {
    render(
      <BlogCard
        slug="sample-post"
        title={{ rendered: 'Sample&nbsp;Post' }}
        thumbnail="/images/dreamonlogo-new.png"
        content={{ rendered: '<p>Summary text</p>' }}
      />
    );

    expect(screen.getByRole('link', { name: /sample post summary text/i })).toHaveAttribute('href', '/post/sample-post');
    expect(screen.getByText('Sample Post')).toBeInTheDocument();
    expect(screen.getByText('Summary text')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /blog post/i })).toHaveAttribute('src', '/images/dreamonlogo-new.png');
  });
});
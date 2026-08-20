import { render, screen } from '@testing-library/react';

import HomePageClient from './page-client';

describe('HomePageClient', () => {
  it('renders the home page hero copy and primary links', () => {
    render(<HomePageClient />);

    expect(screen.getByRole('heading', { name: /dreamon interactive/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /blogs/i })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: /click here to learn more about nyx legacy/i })).toHaveAttribute('href', '/nyx-legacy');
  });
});
import { render, screen } from '@testing-library/react';

import SiteShell from './site-shell';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const { usePathname } = require('next/navigation');

describe('SiteShell', () => {
  it('applies the Nyx theme variables for the Nyx route', () => {
    usePathname.mockReturnValue('/nyx-legacy');

    const { container } = render(
      <SiteShell>
        <div>Page content</div>
      </SiteShell>
    );

    expect(screen.getByText('Page content')).toBeInTheDocument();
    expect(container.firstChild).toHaveStyle({
      '--theme-color': 'rgb(210 128 54)',
      '--outlet-bg': 'rgb(210 128 54)',
    });
  });
});
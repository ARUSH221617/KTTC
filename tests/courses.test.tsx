
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoursesPage from '../src/app/(default)/courses/page';

// Mock the Dialog components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogClose: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        {
          id: 1,
          title: 'Test Course 1',
          description: 'Test Description 1',
          instructor: 'Test Instructor 1',
          duration: '4 weeks',
          category: 'Technology',
          level: 'Beginner',
          thumbnail: '/test-image.jpg',
        },
      ]),
  })
) as jest.Mock;

describe('CoursesPage', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders filters and courses', async () => {
    render(<CoursesPage />);

    await waitFor(() => {
        expect(screen.getByText('Test Course 1')).toBeInTheDocument();
    });

    // Verify "View Details" button is disabled
    const viewDetailsButtons = screen.getAllByText('View Details');
    expect(viewDetailsButtons[0].closest('button')).toBeDisabled();
  });
});


import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoursesPage from '../src/app/(default)/courses/page';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const mockCourses = [
  {
    id: 1,
    title: 'Course 1',
    description: 'Description 1',
    instructor: 'Instructor 1',
    category: 'Teaching Skills',
    level: 'Beginner',
    duration: '2',
    thumbnail: 'thumbnail1.jpg',
  },
  {
    id: 2,
    title: 'Course 2',
    description: 'Description 2',
    instructor: 'Instructor 2',
    category: 'Psychology',
    level: 'Intermediate',
    duration: '6',
    thumbnail: 'thumbnail2.jpg',
  },
];

const server = setupServer(
  rest.get('/api/courses', (req, res, ctx) => {
    return res(ctx.json(mockCourses));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CoursesPage', () => {
  it('should render the courses page with initial courses', async () => {
    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Explore Our Courses')).toBeInTheDocument();
    });

    const courseCards = await screen.findAllByText(/Course/);
    expect(courseCards.length).toBe(2);
  });

  it('should maintain consistent course data on filter change', async () => {
    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Explore Our Courses')).toBeInTheDocument();
    });

    const courseCards = await screen.findAllByText(/Course/);
    expect(courseCards.length).toBe(2);

    const firstCourse = courseCards[0].closest('.group');
    const rating = firstCourse.querySelector('span:last-child').textContent;
    const students = firstCourse.querySelector('div:nth-child(2) > div > div:nth-child(2) > span').textContent;
    const price = firstCourse.querySelector('div:nth-child(2) > div > div:nth-child(2) > div').textContent;


    fireEvent.click(screen.getByText('Clear Filters'));

    await waitFor(() => {
        const firstCourseAfterFilter = screen.getAllByText(/Course/)[0].closest('.group');
        const ratingAfterFilter = firstCourseAfterFilter.querySelector('span:last-child').textContent;
        const studentsAfterFilter = firstCourseAfterFilter.querySelector('div:nth-child(2) > div > div:nth-child(2) > span').textContent;
        const priceAfterFilter = firstCourseAfterFilter.querySelector('div:nth-child(2) > div:nth-child(2) > div').textContent;

        expect(rating).toBe(ratingAfterFilter);
        expect(students).toBe(studentsAfterFilter);
        expect(price).toBe(priceAfterFilter);
    });
  });
});

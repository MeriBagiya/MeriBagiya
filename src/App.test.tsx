import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Plant Catalog title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Plant Catalog/i);
  expect(titleElement).toBeInTheDocument();
});

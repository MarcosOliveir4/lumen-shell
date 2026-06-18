import { render, screen } from '@testing-library/angular';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await render(App);
  });

  it('should create the app', () => {
    const app = screen.getByTestId('app');
    expect(app).toBeInTheDocument();
  });
});

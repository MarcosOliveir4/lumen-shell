import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Auth } from '../../../core/auth';
import { Avatar } from './avatar';

const mockUser = {
  displayName: 'kakaka',
  email: 'kakaka@lumen.com',
};

const authMock = {
  getUser: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
};

describe('Avatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = async (userState = mockUser as unknown) => {
    authMock.getUser.mockReturnValue(of(userState));

    return await render(Avatar, {
      providers: [{ provide: Auth, useValue: authMock }],
    });
  };

  it('should render avatar when user is logged in', async () => {
    await setup();
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();
  });

  it('should NOT render avatar when user is null', async () => {
    await setup(null);

    const avatar = screen.queryByTestId('avatar');
    expect(avatar).not.toBeInTheDocument();
  });

  it('should call the function logout when clicking on menu item', async () => {
    await setup();
    const user = userEvent.setup();

    const avatarTrigger = screen.getByTestId('avatar');
    await user.click(avatarTrigger);

    const avatarLogout = await screen.findByTestId('avatar-logout');
    await user.click(avatarLogout);
    expect(authMock.logout).toHaveBeenCalledTimes(1);
  });
});

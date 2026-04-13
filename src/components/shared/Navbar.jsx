import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const { authUser, isAuthenticated, handleLogout } = useAuth();

  const onLogout = () => {
    handleLogout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">

        {/* Brand */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
        >
          Forum Diskusi
        </button>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Avatar + Nama */}
              <div className="flex items-center gap-2">
                <Avatar
                  src={authUser?.avatar}
                  name={authUser?.name ?? ''}
                  size="sm"
                />
                <span className="hidden text-sm font-medium text-gray-700 sm:block">
                  {authUser?.name}
                </span>
              </div>

              {/* Tombol Buat Thread */}
              <button
                type="button"
                onClick={() => navigate('/threads/create')}
                className="
                  rounded-lg bg-blue-600 px-3 py-1.5
                  text-sm font-medium text-white
                  hover:bg-blue-700 transition-colors
                "
              >
                + Buat Thread
              </button>

              <button
                type="button"
                onClick={() => navigate('/leaderboard')}
                className="
                  rounded-lg border bg-blue-600 border-blue-200 px-3 py-1.5
                  text-sm text-white hover:bg-blue-700 transition-colors transition-colors
                "
              >
                🏆 Leaderboard
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={onLogout}
                className="
                  rounded-lg border border-gray-200 px-3 py-1.5
                  text-sm bg-red-600 text-white
                  hover:bg-red-700 transition-colors
                "
              >
                Keluar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="
                rounded-lg bg-blue-600 px-4 py-1.5
                text-sm font-medium text-white
                hover:bg-blue-700 transition-colors
              "
            >
              Masuk
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

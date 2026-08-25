import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import clsx from "clsx";

import Badge from "../common/Badge";
import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../../lib/constants";

export default function TopBar({ universityName }) {
  const { status, user, logout } = useAuth();

  const navigate = useNavigate();

  const authenticated = status === "authenticated";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header
        className="
          sticky
          top-0
          z-30
          h-12
          border-b
          border-ink-200
          bg-white
          shadow-sm
          lg:ml-64
        "
      >
      <div
        className="
          flex
          h-full
          items-center
          justify-between
          px-4
          
        "
      >

        {/* Dashboard */}

        <div
           className="
             flex items-center flex-1
            pl-3
           "
         >

          {authenticated && universityName && (
            <span
              className="
                flex
                items-center
                gap-1.5
                text-sm
                font-semibold
                text-ink-800
              "
            >
              <Building2 className="h-4 w-4 text-brand-600" />
              {universityName}
            </span>
          )}

        </div>

        {/* Right Side */}

        <div
          className="
            flex
            items-center
            justify-end
            gap-6
          "
        >

          {authenticated ? (
            <>

              {/* Notification */}

              {/* <button
                className="
                  relative
                  rounded-full
                  p-2
                  transition-all
                  duration-300
                  hover:bg-ink-100
                "
              >

                <Bell className="h-4 w-4 text-ink-600" />

                <span
                  className="
                    absolute
                    right-2
                    top-2
                    h-2
                    w-2
                    rounded-full
                    bg-brand-600
                  "
                />

              </button> */}

              {/* User */}

              <div className="flex flex-col items-end leading-tight">
                <span
                  className="
                    text-sm
                    font-semibold
                    text-ink-800
                  "
                >
                  {user.name}
                </span>

                {user.email && (
                  <span className="text-xs text-ink-400">
                    {user.email}
                  </span>
                )}
              </div>

              {/* University Badge */}

              <Badge
                tone="brand"
                className="
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  capitalize
                "
              >
                {user.role}
              </Badge>

              {/* Divider */}

              <div className="h-6 w-px bg-ink-200" />

              {/* Logout */}

              <button
                onClick={handleLogout}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  px-2
                  py-2
                  text-sm
                  font-medium
                  text-ink-600
                  transition-all
                  duration-300
                  hover:text-red-600
                "
              >

                <LogOut className="h-3.5 w-3.5" />

                Log out

              </button>

            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-ink-600"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="
                  rounded-lg
                  bg-brand-600
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-white
                "
              >
                Register
              </Link>
            </>
          )}

        </div>

      </div>

    </header>
  );
}

function TopBarLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          `
          flex
          items-center
          gap-2
          rounded-lg
          px-3 py-1.5
          text-[13px]
          font-semibold
          transition-all
          duration-300
          `,
          isActive
            ? `
              bg-brand-50
              text-brand-700
              border
              border-brand-200
              shadow-sm
            `
            : `
              text-ink-500
              hover:bg-ink-100
              hover:text-brand-700
            `
        )
      }
    >
      <Icon
        className="
          h-4
          w-4
        "
      />

      <span>{label}</span>
    </NavLink>
  );
}

import { Link } from "react-router-dom";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { usePositionedMenu } from "@/hooks/usePositionedMenu";
import PositionedPopover from "@/components/shared/PositionedPopover";
import Avatar from "@/components/shared/Avatar";

// Header user menu — the avatar trigger opens a small popover with the
// current user's name/email, a link to Settings, and Log out. Built on the
// same usePositionedMenu + PositionedPopover shell every other dropdown in
// the app already uses (StakeholderAssigner, ProductAssigner, ...).
export default function UserMenu() {
  const { user, logout } = useAuth();
  const { isOpen, coords, triggerRef, toggle, close } = usePositionedMenu({ closeOnScroll: true });

  if (!user) return null;

  const displayName = user.full_name || user.email;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className="flex items-center gap-1.5 rounded-full hover:opacity-80 transition-opacity"
        aria-label="Account menu"
      >
        <Avatar name={displayName} avatarUrl={user.avatar_url} size="sm" />
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      <PositionedPopover
        isOpen={isOpen}
        coords={coords}
        close={close}
        panelClassName="fixed w-56 bg-card border border-border rounded-md shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100"
      >
        <div className="px-3 py-2 border-b border-border">
          <p className="text-sm font-medium truncate">{displayName}</p>
          {user.full_name && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
        </div>
        <Link
          to="/settings"
          onClick={close}
          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={() => { close(); logout(); }}
          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </PositionedPopover>
    </>
  );
}

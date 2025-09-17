/**
 * User List Component for P2P Chat
 *
 * Displays room participants with status indicators and actions.
 */
import { Show, For, createSignal } from "solid-js";
export const UserList = (props) => {
    const [selectedUser, setSelectedUser] = createSignal(null);
    // Get status icon for user
    const getStatusIcon = (status) => {
        switch (status) {
            case "online":
                return "🟢";
            case "away":
                return "🟡";
            case "busy":
                return "🔴";
            case "offline":
                return "⚫";
            default:
                return "⚪";
        }
    };
    // Get status color class
    const getStatusClass = (status) => {
        return `reynard-user-list__status--${status}`;
    };
    // Format last seen time
    const formatLastSeen = (lastSeen) => {
        if (!lastSeen)
            return "Never";
        const now = Date.now();
        const diff = now - lastSeen;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1)
            return "Just now";
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        if (days < 7)
            return `${days}d ago`;
        return new Date(lastSeen).toLocaleDateString();
    };
    // Sort users by status and name
    const sortedUsers = () => {
        return [...props.users].sort((a, b) => {
            // Current user first
            if (a.id === props.currentUser.id)
                return -1;
            if (b.id === props.currentUser.id)
                return 1;
            // Then by status
            const statusOrder = { online: 0, away: 1, busy: 2, offline: 3 };
            const aStatus = statusOrder[a.status] ?? 4;
            const bStatus = statusOrder[b.status] ?? 4;
            if (aStatus !== bStatus) {
                return aStatus - bStatus;
            }
            // Finally by name
            return a.name.localeCompare(b.name);
        });
    };
    return (<div class={`reynard-user-list ${props.compact ? "reynard-user-list--compact" : ""}`}>
      {/* Header */}
      <div class="reynard-user-list__header">
        <h3 class="reynard-user-list__title">
          Participants ({props.users.length})
        </h3>
      </div>

      {/* User List */}
      <div class="reynard-user-list__items">
        <Show when={props.users.length > 0} fallback={<div class="reynard-user-list__empty">
              <div class="reynard-user-list__empty-icon">👥</div>
              <div class="reynard-user-list__empty-text">No participants</div>
            </div>}>
          <For each={sortedUsers()}>
            {(user) => (<div class={`reynard-user-list__item ${user.id === props.currentUser.id
                ? "reynard-user-list__item--current"
                : ""} ${selectedUser() === user.id
                ? "reynard-user-list__item--selected"
                : ""}`} onClick={() => {
                setSelectedUser(user.id);
                props.onUserSelect?.(user);
            }}>
                {/* User Avatar */}
                <div class="reynard-user-list__item-avatar">
                  <div class="reynard-user-list__avatar">
                    {user.avatar || user.name.charAt(0)}
                  </div>

                  {/* Status Indicator */}
                  <Show when={props.showStatus}>
                    <div class={`reynard-user-list__status-indicator ${getStatusClass(user.status)}`}>
                      <span class="reynard-user-list__status-dot"></span>
                    </div>
                  </Show>
                </div>

                {/* User Info */}
                <div class="reynard-user-list__item-content">
                  <div class="reynard-user-list__item-header">
                    <span class="reynard-user-list__item-name">
                      {user.name}
                      <Show when={user.id === props.currentUser.id}>
                        <span class="reynard-user-list__you-indicator">
                          {" "}
                          (You)
                        </span>
                      </Show>
                    </span>

                    <Show when={props.showStatus && !props.compact}>
                      <span class="reynard-user-list__status-icon">
                        {getStatusIcon(user.status)}
                      </span>
                    </Show>
                  </div>

                  <Show when={!props.compact}>
                    <div class="reynard-user-list__item-footer">
                      <Show when={props.showStatus}>
                        <span class={`reynard-user-list__status-text ${getStatusClass(user.status)}`}>
                          {user.status}
                        </span>
                      </Show>

                      <Show when={user.status === "offline" && user.lastSeen}>
                        <span class="reynard-user-list__last-seen">
                          Last seen {formatLastSeen(user.lastSeen)}
                        </span>
                      </Show>

                      <Show when={user.metadata?.role}>
                        <span class="reynard-user-list__role">
                          {user.metadata.role}
                        </span>
                      </Show>
                    </div>
                  </Show>
                </div>

                {/* User Actions */}
                <Show when={props.showActions && user.id !== props.currentUser.id}>
                  <div class="reynard-user-list__item-actions">
                    <button class="reynard-user-list__action reynard-user-list__action--message" onClick={(e) => {
                e.stopPropagation();
                console.log("Direct message to:", user.name);
            }} title="Send direct message">
                      💬
                    </button>

                    <button class="reynard-user-list__action reynard-user-list__action--profile" onClick={(e) => {
                e.stopPropagation();
                console.log("View profile:", user.name);
            }} title="View profile">
                      👤
                    </button>

                    <button class="reynard-user-list__action reynard-user-list__action--more" onClick={(e) => {
                e.stopPropagation();
                console.log("More actions for:", user.name);
            }} title="More actions">
                      ⋯
                    </button>
                  </div>
                </Show>
              </div>)}
          </For>
        </Show>
      </div>

      {/* Online Count */}
      <Show when={props.showStatus && !props.compact}>
        <div class="reynard-user-list__footer">
          <div class="reynard-user-list__online-count">
            {props.users.filter((u) => u.status === "online").length} online
          </div>
        </div>
      </Show>
    </div>);
};

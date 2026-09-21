<template>
  <aside class="sidebar">
    <header class="brand">
      <img class="logo" src="/navbar/logo-sitter.svg" width="106" height="32" alt="Sitter" />
      <img class="star" src="/navbar/logo-star.svg" width="17" height="17" alt="" />
    </header>
    <nav aria-label="Sitter menu">
      <RouterLink class="nav-item" to="/sitter/profile">
        <span class="nav-icon profile" aria-hidden="true"></span>
        <span class="label">Pet Sitter Profile</span>
      </RouterLink>
      <RouterLink class="nav-item" to="/sitter/bookings">
        <span class="nav-icon list" aria-hidden="true"></span>
        <span class="label">Booking List</span>
        <span class="badge" aria-hidden="true"></span>
      </RouterLink>
      <RouterLink class="nav-item" to="/sitter/calendar">
        <span class="nav-icon calendar" aria-hidden="true"></span>
        <span class="label">Calendar</span>
      </RouterLink>
      <RouterLink class="nav-item" to="/sitter/payout">
        <span class="nav-icon card" aria-hidden="true"></span>
        <span class="label">Payout Option</span>
      </RouterLink>
    </nav>
    <RouterLink class="nav-item logout" :to="{ path: '/login', query: { role: 'sitter' } }">
      <span class="nav-icon exit" aria-hidden="true"></span>
      <span class="label">Back to Login</span>
    </RouterLink>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  flex: none;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e4f2;
  background: #fff;
}
.brand {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 28px 24px 12px;
}
.logo { display: block; width: 106px; height: auto; }
.star { position: absolute; top: 24px; left: 122px; }
.sidebar nav { display: flex; flex-direction: column; gap: 4px; margin-top: 18px; }
.nav-item {
  display: flex;
  gap: 14px;
  align-items: center;
  min-height: 52px;
  padding: 10px 22px;
  color: #7b7e8f;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
}
.nav-item.router-link-active {
  color: #ff7037;
  background: #fff1ec;
  font-weight: 600;
}
.nav-icon {
  flex: none;
  width: 20px;
  height: 20px;
  background: currentColor;
  -webkit-mask: var(--icon) center / contain no-repeat;
  mask: var(--icon) center / contain no-repeat;
}
.profile { --icon: url('/navbar/menu-profile.svg'); }
.list { --icon: url('/icon/list.svg'); }
.calendar { --icon: url('/icon/calendar.svg'); }
.card { --icon: url('/icon/credit-card.svg'); }
.exit { --icon: url('/navbar/menu-logout.svg'); }
.badge {
  width: 6px;
  height: 6px;
  margin-left: auto;
  border-radius: 50%;
  background: #ff7037;
}
.logout { margin-top: auto; border-top: 1px solid #e0e4f2; }
@media (max-width: 760px) {
  .sidebar { width: 72px; }
  .brand { padding: 22px 8px; justify-content: center; }
  .logo { width: 40px; }
  .star { display: none; }
  .nav-item { justify-content: center; padding: 10px; }
  .label,
  .badge { display: none; }
}
</style>

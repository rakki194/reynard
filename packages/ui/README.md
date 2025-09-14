# reynard-ui

Advanced layout and navigation components for building sophisticated SolidJS applications.

## 🚀 Features

- **📐 Layout System**: AppLayout with responsive sidebar, Grid with responsive breakpoints
- **🧭 Navigation**: Breadcrumb navigation, hierarchical NavMenu with keyboard support
- **📊 Data Display**: Feature-rich DataTable with sorting, filtering, pagination
- **🎭 Overlays**: Slide-out Drawer component with multiple positions
- **♿ Accessibility**: Full ARIA support, keyboard navigation, screen reader friendly
- **📱 Responsive**: Mobile-first design with adaptive behaviors
- **🎨 Themeable**: Integrates with Reynard's theming system
- **⚡ Performance**: Optimized for SolidJS's fine-grained reactivity

## 📦 Installation

```bash
npm install reynard-ui reynard-core reynard-components solid-js
```

## 🎯 Quick Start

```tsx
import { AppLayout, Grid, GridItem, DataTable } from "reynard-ui";
import "reynard-ui/styles";

function App() {
  return (
    <AppLayout
      sidebar={<nav>Sidebar content</nav>}
      header={<header>App Header</header>}
    >
      <Grid columns={{ xs: 1, md: 2, lg: 3 }} gap="1rem">
        <GridItem colSpan={{ xs: 1, md: 2 }}>
          <DataTable
            data={users}
            columns={userColumns}
            selectable
            showPagination
          />
        </GridItem>
        <GridItem>
          <div>Sidebar content</div>
        </GridItem>
      </Grid>
    </AppLayout>
  );
}
```

## 📚 Components

### Layout Components

#### AppLayout

Complete application layout with sidebar, header, and content areas.

```tsx
<AppLayout
  sidebar={<Navigation />}
  header={<AppHeader />}
  footer={<AppFooter />}
  collapsible
  overlayOnMobile
  sidebarWidth={280}
>
  <MainContent />
</AppLayout>
```

> _Features:_

- Responsive sidebar with collapse/expand
- Mobile overlay behavior
- Keyboard shortcuts (Ctrl+B to toggle)
- Persistent state (localStorage)
- Customizable breakpoints

#### Grid & GridItem

Responsive CSS Grid system with breakpoint support.

```tsx
<Grid
  columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
  gap="1.5rem"
  autoRows="min-content"
>
  <GridItem colSpan={{ xs: 1, md: 2 }}>
    <Card>Featured content</Card>
  </GridItem>
  <GridItem>
    <Card>Regular content</Card>
  </GridItem>
</Grid>;

{
  /* Auto-fit grid */
}
<Grid autoFit minColumnWidth="300px">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>;

{
  /* Masonry layout */
}
<MasonryGrid columns={{ xs: 2, md: 3, lg: 4 }}>
  <div>Variable height content</div>
  <div>Another item</div>
</MasonryGrid>;
```

> _Props:_

- `columns`: Responsive column configuration
- `gap`: Space between grid items
- `autoFit`: Use auto-fit with minimum column width
- `autoRows`, `autoFlow`: CSS Grid properties

### Navigation Components

#### Breadcrumb

Hierarchical navigation with customizable separators.

```tsx
const breadcrumbItems = [
  { id: "home", label: "Home", href: "/" },
  { id: "docs", label: "Documentation", href: "/docs" },
  { id: "api", label: "API Reference", current: true },
];

<Breadcrumb
  items={breadcrumbItems}
  separator="›"
  maxItems={5}
  showHomeIcon
  onItemClick={(item, e) => navigate(item.href)}
/>;
```

> _Features:_

- Automatic truncation with ellipsis
- Custom separators and icons
- Click handling with navigation
- Accessible markup

#### NavMenu

Hierarchical navigation menu with keyboard support.

```tsx
const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: <DashboardIcon />,
    active: true,
  },
  {
    id: "users",
    label: "Users",
    icon: <UsersIcon />,
    badge: 12,
    children: [
      { id: "all-users", label: "All Users", href: "/users" },
      { id: "user-roles", label: "Roles", href: "/users/roles" },
    ],
  },
];

<NavMenu
  items={menuItems}
  orientation="vertical"
  showIcons
  showBadges
  onItemClick={(item) => navigate(item.href)}
  onActiveChange={(itemId) => setActiveItem(itemId)}
/>;
```

> _Features:_

- Nested submenus with keyboard navigation
- Icons and badges support
- Hover or click to open submenus
- Full ARIA support

### Data Display Components

#### DataTable

Feature-rich table with enterprise-grade functionality.

```tsx
const columns = [
  {
    id: "name",
    header: "Name",
    accessor: "name",
    sortable: true,
    filterable: true,
  },
  {
    id: "email",
    header: "Email",
    accessor: "email",
    sortable: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: (value, row) => (
      <div>
        <Button size="sm" onClick={() => editUser(row)}>
          Edit
        </Button>
        <Button size="sm" variant="danger" onClick={() => deleteUser(row)}>
          Delete
        </Button>
      </div>
    ),
  },
];

<DataTable
  data={users}
  columns={columns}
  selectable
  selectAll
  page={currentPage}
  pageSize={25}
  showPagination
  showPageSizeSelector
  loading={isLoading}
  onRowSelect={(selectedRows) => setSelected(selectedRows)}
  onSort={(column, direction) => handleSort(column, direction)}
  onPageChange={(page) => setCurrentPage(page)}
  onRowClick={(row) => viewUser(row)}
/>;
```

> _Features:_

- Sorting with visual indicators
- Row selection (single/multi)
- Pagination with customizable page sizes
- Custom cell renderers
- Loading states
- Empty state handling
- Responsive design

### Overlay Components

#### Drawer

Slide-out panel component with multiple positions.

```tsx
<Drawer
  open={isOpen}
  onClose={() => setIsOpen(false)}
  position="right"
  size="lg"
  title="User Settings"
  footer={
    <div>
      <Button onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={saveSettings}>
        Save
      </Button>
    </div>
  }
>
  <UserSettingsForm />
</Drawer>
```

> _Features:_

- Four positions: left, right, top, bottom
- Multiple sizes with custom dimensions
- Backdrop click and escape key handling
- Focus management and keyboard trapping
- Smooth animations

## 🎨 Styling

Components use CSS custom properties for theming:

```css
:root {
  --card-bg: hsl(220deg 15% 85%);
  --text-primary: hsl(240deg 15% 12%);
  --accent: hsl(270deg 60% 60%);
  --border-color: hsl(220deg 15% 75%);
  /* ... */
}
```

All components automatically adapt to your theme and work seamlessly with `reynard-core`'s theming system.

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactive components
- **Screen Readers**: Proper ARIA labels, roles, and properties
- **Focus Management**: Logical focus order and visible focus indicators
- **Color Contrast**: Meets WCAG 2.1 AA standards
- **Semantic HTML**: Proper heading hierarchy and landmark usage

## 📦 Bundle Size

- **Core package**: ~35 kB (8.4 kB gzipped)
- **Tree-shakable**: Import only the components you need
- **Dependency-aware**: Efficiently reuses reynard-core utilities

## 🔧 Advanced Usage

### Custom Grid Breakpoints

```tsx
// Custom responsive configuration
<Grid
  columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 6 }}
  gap={{ xs: "1rem", lg: "2rem" }}
>
  <GridItem colSpan={{ xs: 1, md: 2, xl: 3 }}>
    Featured content spans multiple columns
  </GridItem>
</Grid>
```

### Data Table with Remote Data

```tsx
function RemoteDataTable() {
  const [data, setData] = createSignal([]);
  const [page, setPage] = createSignal(1);
  const [loading, setLoading] = createSignal(false);

  const fetchData = async (page: number, sort?: string) => {
    setLoading(true);
    const response = await api.getUsers({ page, sort });
    setData(response.data);
    setLoading(false);
  };

  return (
    <DataTable
      data={data()}
      columns={columns}
      page={page()}
      loading={loading()}
      onPageChange={(newPage) => {
        setPage(newPage);
        fetchData(newPage);
      }}
      onSort={(column, direction) => {
        fetchData(page(), `${column}:${direction}`);
      }}
    />
  );
}
```

### Navigation with Route Matching

```tsx
function AppNavigation() {
  const location = useLocation();

  const menuItems = createMemo(() =>
    navConfig.map((item) => ({
      ...item,
      active: location.pathname.startsWith(item.href),
    })),
  );

  return (
    <NavMenu items={menuItems()} onItemClick={(item) => navigate(item.href)} />
  );
}
```

## 🤝 Contributing

See the main [Reynard repository](../../README.md) for contribution guidelines.

---

**Built with ❤️ for modern SolidJS applications** 🦊

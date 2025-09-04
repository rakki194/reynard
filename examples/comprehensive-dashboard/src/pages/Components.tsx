import { createSignal, For, Show } from "solid-js";
import {
  AppLayout,
  Grid,
  DataTable,
  Drawer,
  NavMenu,
  Breadcrumb,
} from "@reynard/ui";
import {
  Card,
  Modal,
  Tabs,
  Button,
  TextField,
  Select,
} from "@reynard/components";
import { useI18n, useNotifications } from "@reynard/core";

export function Components() {
  const { t } = useI18n();
  const { addNotification } = useNotifications();

  // State for component demos
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [isDrawerOpen, setIsDrawerOpen] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal("primitives");
  const [inputValue, setInputValue] = createSignal("");
  const [selectValue, setSelectValue] = createSignal("option1");

  // Sample data for table
  const tableData = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "User",
      status: "Active",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "User",
      status: "Inactive",
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice@example.com",
      role: "Moderator",
      status: "Active",
    },
  ];

  const tableColumns = [
    { key: "name", header: t("components.table.name"), sortable: true },
    { key: "email", header: t("components.table.email"), sortable: true },
    { key: "role", header: t("components.table.role"), sortable: false },
    {
      key: "status",
      header: t("components.table.status"),
      sortable: true,
      render: (value: string) => (
        <span
          class={`px-2 py-1 rounded-full text-xs ${
            value === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: t("components.breadcrumb.home"), href: "/" },
    { label: t("components.breadcrumb.components"), href: "/components" },
    { label: t("components.breadcrumb.showcase") },
  ];

  const navMenuItems = [
    {
      label: t("components.nav.dashboard"),
      href: "/dashboard",
      icon: "📊",
      active: false,
    },
    {
      label: t("components.nav.users"),
      href: "/users",
      icon: "👥",
      active: false,
    },
    {
      label: t("components.nav.settings"),
      href: "/settings",
      icon: "⚙️",
      active: false,
    },
    {
      label: t("components.nav.components"),
      href: "/components",
      icon: "🧩",
      active: true,
    },
  ];

  const tabItems = [
    { id: "primitives", label: t("components.tabs.primitives") },
    { id: "layout", label: t("components.tabs.layout") },
    { id: "data", label: t("components.tabs.data") },
    { id: "navigation", label: t("components.tabs.navigation") },
  ];

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{t("components.title")}</h1>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <Card>
        <div class="p-6">
          <Tabs
            items={tabItems}
            activeTab={activeTab()}
            onTabChange={setActiveTab}
            variant="pills"
          />

          <div class="mt-6">
            <Show when={activeTab() === "primitives"}>
              <div class="space-y-8">
                <div>
                  <h2 class="text-lg font-semibold mb-4">
                    {t("components.primitives.buttons.title")}
                  </h2>
                  <div class="flex flex-wrap gap-4">
                    <Button
                      variant="primary"
                      onClick={() =>
                        addNotification({
                          type: "success",
                          message: t("components.primitives.buttons.clicked", {
                            variant: "Primary",
                          }),
                        })
                      }
                    >
                      {t("components.primitives.buttons.primary")}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        addNotification({
                          type: "info",
                          message: t("components.primitives.buttons.clicked", {
                            variant: "Secondary",
                          }),
                        })
                      }
                    >
                      {t("components.primitives.buttons.secondary")}
                    </Button>
                    <Button
                      variant="tertiary"
                      onClick={() =>
                        addNotification({
                          type: "info",
                          message: t("components.primitives.buttons.clicked", {
                            variant: "Tertiary",
                          }),
                        })
                      }
                    >
                      {t("components.primitives.buttons.tertiary")}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        addNotification({
                          type: "info",
                          message: t("components.primitives.buttons.clicked", {
                            variant: "Ghost",
                          }),
                        })
                      }
                    >
                      {t("components.primitives.buttons.ghost")}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() =>
                        addNotification({
                          type: "warning",
                          message: t("components.primitives.buttons.clicked", {
                            variant: "Danger",
                          }),
                        })
                      }
                    >
                      {t("components.primitives.buttons.danger")}
                    </Button>
                  </div>

                  <div class="flex flex-wrap gap-4 mt-4">
                    <Button size="sm" variant="primary">
                      {t("components.primitives.buttons.small")}
                    </Button>
                    <Button size="md" variant="primary">
                      {t("components.primitives.buttons.medium")}
                    </Button>
                    <Button size="lg" variant="primary">
                      {t("components.primitives.buttons.large")}
                    </Button>
                  </div>
                </div>

                <div>
                  <h2 class="text-lg font-semibold mb-4">
                    {t("components.primitives.inputs.title")}
                  </h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <TextField
                      label={t("components.primitives.inputs.text")}
                      placeholder={t(
                        "components.primitives.inputs.textPlaceholder",
                      )}
                      value={inputValue()}
                      onInput={(e) => setInputValue(e.target.value)}
                    />
                    <TextField
                      label={t("components.primitives.inputs.password")}
                      type="password"
                      placeholder={t(
                        "components.primitives.inputs.passwordPlaceholder",
                      )}
                    />
                    <TextField
                      label={t("components.primitives.inputs.email")}
                      type="email"
                      placeholder={t(
                        "components.primitives.inputs.emailPlaceholder",
                      )}
                    />
                    <Select
                      label={t("components.primitives.inputs.select")}
                      value={selectValue()}
                      onInput={(e) => setSelectValue(e.target.value)}
                      options={[
                        {
                          value: "option1",
                          label: t("components.primitives.inputs.option1"),
                        },
                        {
                          value: "option2",
                          label: t("components.primitives.inputs.option2"),
                        },
                        {
                          value: "option3",
                          label: t("components.primitives.inputs.option3"),
                        },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <h2 class="text-lg font-semibold mb-4">
                    {t("components.primitives.cards.title")}
                  </h2>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <div class="p-4">
                        <h3 class="font-semibold">
                          {t("components.primitives.cards.simple")}
                        </h3>
                        <p class="text-sm text-gray-600 mt-2">
                          {t("components.primitives.cards.simpleDesc")}
                        </p>
                      </div>
                    </Card>
                    <Card variant="elevated">
                      <div class="p-4">
                        <h3 class="font-semibold">
                          {t("components.primitives.cards.elevated")}
                        </h3>
                        <p class="text-sm text-gray-600 mt-2">
                          {t("components.primitives.cards.elevatedDesc")}
                        </p>
                      </div>
                    </Card>
                    <Card variant="outlined">
                      <div class="p-4">
                        <h3 class="font-semibold">
                          {t("components.primitives.cards.outlined")}
                        </h3>
                        <p class="text-sm text-gray-600 mt-2">
                          {t("components.primitives.cards.outlinedDesc")}
                        </p>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </Show>

            <Show when={activeTab() === "layout"}>
              <div class="space-y-8">
                <div>
                  <h2 class="text-lg font-semibold mb-4">
                    {t("components.layout.grid.title")}
                  </h2>
                  <Grid columns={3} gap="md">
                    <Card>
                      <div class="p-4 text-center">
                        <div class="text-2xl mb-2">📊</div>
                        <div class="font-medium">
                          {t("components.layout.grid.item1")}
                        </div>
                      </div>
                    </Card>
                    <Card>
                      <div class="p-4 text-center">
                        <div class="text-2xl mb-2">👥</div>
                        <div class="font-medium">
                          {t("components.layout.grid.item2")}
                        </div>
                      </div>
                    </Card>
                    <Card>
                      <div class="p-4 text-center">
                        <div class="text-2xl mb-2">⚙️</div>
                        <div class="font-medium">
                          {t("components.layout.grid.item3")}
                        </div>
                      </div>
                    </Card>
                  </Grid>
                </div>

                <div>
                  <h2 class="text-lg font-semibold mb-4">
                    {t("components.layout.modals.title")}
                  </h2>
                  <div class="space-x-4">
                    <Button
                      variant="primary"
                      onClick={() => setIsModalOpen(true)}
                    >
                      {t("components.layout.modals.open")}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsDrawerOpen(true)}
                    >
                      {t("components.layout.modals.openDrawer")}
                    </Button>
                  </div>
                </div>
              </div>
            </Show>

            <Show when={activeTab() === "data"}>
              <div class="space-y-8">
                <div>
                  <h2 class="text-lg font-semibold mb-4">
                    {t("components.data.table.title")}
                  </h2>
                  <DataTable
                    data={tableData}
                    columns={tableColumns}
                    sortable={true}
                    searchable={true}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    onRowClick={(row) =>
                      addNotification({
                        type: "info",
                        message: t("components.data.table.rowClicked", {
                          name: row.name,
                        }),
                      })
                    }
                  />
                </div>
              </div>
            </Show>

            <Show when={activeTab() === "navigation"}>
              <div class="space-y-8">
                <div>
                  <h2 class="text-lg font-semibold mb-4">
                    {t("components.navigation.menu.title")}
                  </h2>
                  <div class="max-w-xs">
                    <NavMenu
                      items={navMenuItems}
                      onItemClick={(item) =>
                        addNotification({
                          type: "info",
                          message: t("components.navigation.menu.clicked", {
                            label: item.label,
                          }),
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <h2 class="text-lg font-semibold mb-4">
                    {t("components.navigation.breadcrumb.title")}
                  </h2>
                  <Breadcrumb
                    items={breadcrumbItems}
                    onItemClick={(item) =>
                      addNotification({
                        type: "info",
                        message: t("components.navigation.breadcrumb.clicked", {
                          label: item.label,
                        }),
                      })
                    }
                  />
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen()}
        onClose={() => setIsModalOpen(false)}
        title={t("components.modal.title")}
      >
        <div class="space-y-4">
          <p>{t("components.modal.content")}</p>
          <div class="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t("components.modal.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                addNotification({
                  type: "success",
                  message: t("components.modal.confirmed"),
                });
              }}
            >
              {t("components.modal.confirm")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Drawer */}
      <Drawer
        isOpen={isDrawerOpen()}
        onClose={() => setIsDrawerOpen(false)}
        title={t("components.drawer.title")}
        position="right"
      >
        <div class="space-y-4">
          <p>{t("components.drawer.content")}</p>
          <div class="space-y-3">
            <For each={["info", "warning", "success", "error"]}>
              {(type) => (
                <Button
                  variant="secondary"
                  class="w-full"
                  onClick={() => {
                    addNotification({
                      type: type as any,
                      message: t("components.drawer.notification", { type }),
                    });
                  }}
                >
                  {t("components.drawer.show")} {type}
                </Button>
              )}
            </For>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

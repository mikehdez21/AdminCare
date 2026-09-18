# Architecture

Keep authentication and protected routing intact. `MainLayout` should render the sidebar and a stable empty `MainContent` outlet/area when no feature route is selected. The default post-login route should target the shell without requiring a Home component. Remove only Home-specific imports/components/permissions and do not alter unrelated module routes.

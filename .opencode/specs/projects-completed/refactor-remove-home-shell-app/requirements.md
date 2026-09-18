# Requirements

Remove the obsolete Home/HomeResumen feature and make the authenticated landing state an application shell: sidebar available for navigation and an intentionally blank main content area until the user selects a module.

## Contract
- Login must enter the authenticated app shell, not a Home page.
- Remove obsolete Home routes, redirects, lazy imports and Home permissions/references.
- Preserve all non-Home permissions, protected routes and sidebar navigation.
- Blank main content is intentional and must not be treated as an error.

# myENA table

Components to render a table (or data grid if you will) using prefetched data (ClientTable) or data served by an API (ServerTable).

## Why another table/grid

- Combines the best features in other libraries
- Has an easy to use, simple API
- Can easily be extended and any part can be overwritten
- Used in production in multiple projects
- Actively maintained by a team of frontend engineers


## Dependencies

- Vue 3
- Ramda (only if you'r including the src)
- Axios (soft - used for ServerTable. Will not be needed if you don't use it or if you pass the `fetchData` prop)
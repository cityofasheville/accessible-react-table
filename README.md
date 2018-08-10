# accessible-react-table

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

A higher order component that adds accessibility features to [react-table](https://react-table.js.org/)
that follow the [WAI-ARIA 1.1 grid pattern](https://www.w3.org/TR/wai-aria-practices/#grid).

## Usage
The simplest usage to just replace `ReactTable` with `AccessibleReactTable`. You will need the following import.
```js
import AccessibleReactTable from 'accessible-react-table';
```

However, as this was developed as a higher order component, you can also use it as such.
```js
import ReactTable from 'react-table';
import { accessibility } from 'accessible-react-table';

const AccessibleReactTable = accessibility(ReactTable);
```

### Important Note

This HoC requires that your ReactTable has unique column accessors or unique column IDs.

Because react-table does not have a numeric column index in its back end, the column identifiers are used to
implement accessible keyboard navigation in an unfortunately roundabout kind of way.

### Inner Focus
When a cell contains a single focusable element, the grid pattern recommends that focus goes directly
to that element rather than the cell. Additionally, a grid should only ever contain a single element with a
tab index greater than -1. As such, special attention must be given to cells that contain normally focusable
elements such as buttons, inputs, checkboxes, etc.

accessible-react-table adds special constructs for dealing with this "inner focus" and tries to handle as much
as it can for you. However, there are some extra steps required for you as shown in the example react-table
cell renderer shown below.

```js
import { CellFocusWrapper } from 'accessible-react-table';

// The columns property of a ReactTable.
columns: [
  {
    Header: 'First Name',
    accessor: 'firstName', // unique identifier for this column
    /* must set innerFocus to true to signal to accessible-react-table
       that this column has cells focusable elements inside */
    innerFocus: true,
    Cell: row => (
      <CellFocusWrapper> // Wrapper component to help manage inner focus
        {(focusRef, focusable) => (
          /* tabIndex must be set this way in order to obey grid pattern
             when a cell contains focusable elements inside of it.
             Additionally, the focusRef tells accessible-react-table
             which element to pass focus to */
          <a href="#" tabIndex={focusable ? 0 : -1} ref={focusRef}>
            {`${row.value}`}
          </a>
        )}
      </CellFocusWrapper>
    ),
  },
]
```

In addition to cell renderers, this same technique should be used if your table utilizes a custom filter
renderer.

[build-badge]: https://img.shields.io/travis/dumptruckman/accessible-react-table/master.png?style=flat-square
[build]: https://travis-ci.org/dumptruckman/accessible-react-table

[npm-badge]: https://img.shields.io/npm/v/accessible-react-table.png?style=flat-square
[npm]: https://www.npmjs.org/package/accessible-react-table

[coveralls-badge]: https://img.shields.io/coveralls/dumptruckman/accessible-react-table/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/dumptruckman/accessible-react-table

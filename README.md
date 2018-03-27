# accessible-react-table

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

A higher order component that adds accessibility features to [react-table](https://react-table.js.org/).

## Usage
The simplest usage to just replace `ReactTable` with `AccessibleReactTable`. You will need the following import.
```js
import { AccessibleReactTable } from 'accessible-react-table';
```

However, as this was developed as a higher order component, you can also use it as such.
```js
import ReactTable from 'react-table';
import accessibility from 'accessible-react-table';

const AccessibleReactTable = accessibility(ReactTable);
```

[build-badge]: https://img.shields.io/travis/dumptruckman/accessible-react-table/master.png?style=flat-square
[build]: https://travis-ci.org/dumptruckman/accessible-react-table

[npm-badge]: https://img.shields.io/npm/v/accessible-react-table.png?style=flat-square
[npm]: https://www.npmjs.org/package/accessible-react-table

[coveralls-badge]: https://img.shields.io/coveralls/dumptruckman/accessible-react-table/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/dumptruckman/accessible-react-table

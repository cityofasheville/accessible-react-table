import React, { Component } from 'react';
import { render } from 'react-dom';
import 'react-table/react-table.css';
import makeData from './utils';
import AccessibleReactTable, { CellFocusWrapper } from '../../src/index';

class Demo extends Component {
  constructor() {
    super();
    this.state = {
      data: makeData(),
    };
  }

  render() {
    const { data } = this.state;
    // eslint-disable-next-line prefer-destructuring
    return (
      <div>
        <h1>accessible-react-table Demo</h1>
        <AccessibleReactTable
          data={data}
          columns={[
            {
              Header: 'Name',
              columns: [
                {
                  Header: 'First Name',
                  accessor: 'firstName',
                  innerFocus: true,
                  Cell: row => (
                    <CellFocusWrapper>
                      {(focusRef, focusable) => (
                        /* tabIndex must be set this way in order to obey grid pattern when a
                          cell contains focusable elements inside of it. This cell renderer will
                          need to control any keyboard navigation for multiple focusable elements
                          within it. */
                        <a href="#" tabIndex={focusable ? 0 : -1} ref={focusRef}>
                          {`${row.value}`}
                        </a>
                      )}
                    </CellFocusWrapper>
                  ),
                },
                {
                  Header: 'Last Name',
                  id: 'lastName',
                  accessor: d => d.lastName,
                },
              ],
            },
            {
              Header: 'Info',
              columns: [
                {
                  Header: 'Age',
                  accessor: 'age',
                },
                {
                  Header: 'Status',
                  accessor: 'status',
                },
              ],
            },
            {
              Header: 'Stats',
              columns: [
                {
                  Header: 'Visits',
                  accessor: 'visits',
                },
              ],
            },
          ]}
          filterable
          defaultPageSize={10}
          className="-striped -highlight"
        />
      </div>
    );
  }
}

render(<Demo />, document.getElementById('app'));

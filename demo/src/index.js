import React, { Component } from 'react';
import { render } from 'react-dom';
import 'react-table/react-table.css';
import makeData from './utils';
import AccessibleReactTable, { AccessibleReactTableContext as Context } from '../../src/index';

class Demo extends Component {
  constructor() {
    super();
    this.state = {
      data: makeData(),
    };
  }
  render() {
    const { data } = this.state;
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
                  Cell: (row) => {
                    console.log('row=', row);
                    return (
                      <Context.Consumer>
                        {({ nameAdder }) => {
                          nameAdder(row.value);
                          return (
                            <span>{`${row.value}`}</span>
                          );
                        }}
                      </Context.Consumer>
                    );
                  },
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
          defaultPageSize={10}
          className="-striped -highlight"
        />
      </div>
    );
  }
}

render(<Demo />, document.getElementById('app'));

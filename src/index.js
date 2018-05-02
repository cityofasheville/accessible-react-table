import React from 'react';
import PropTypes from 'prop-types';
import mergeProps from 'merge-prop-functions';
import ReactTable from 'react-table';
import namor from 'namor';

export const AccessibleReactTableContext = React.createContext();

const { Provider } = AccessibleReactTableContext;

const getColumnId = (column) => {
  if (column.id) {
    return column.id;
  }
  return column.expander && 'rt-expandable';
};

const getCustomTrGroupProps = () => ({
  role: 'rowgroup',
});

const getCustomTrProps = () => ({
  role: 'row',
});

// const exports = module.exports = {};

export function accessibility(WrappedReactTable) {
  class AccessibleReactTable extends React.Component {
    // Filter row counts as a header row.
    extraHeaderRowCount = this.props.filterable ? 1 : 0;

    state = {
      focused: {
        row: 1 + this.extraHeaderRowCount,
        column: 0,
        managedByChild: false,
      },
    };

    onSortedChange = (sorted) => {
      // Store the react-table sorted data in this components state.
      this.setState({
        sorted: sorted[0],
      });
    };

    onFocus = (rtState, rowIndex, column) => () => {
      console.log('focused row=', rowIndex);
      const columnId = getColumnId(column);
      const newFocused = {
        row: rowIndex,
        column: rtState.allVisibleColumns.findIndex(c => getColumnId(c) === columnId),
      };

      this.setState({
        focused: newFocused,
      });
    };

    onKeyDown = rtState => (e) => {
      const columns = rtState.allVisibleColumns;
      let focusedCol = this.state.focused.column;
      let focusedRow = this.state.focused.row;

      let changed = false;
      if (e.key === 'ArrowLeft') {
        if (focusedCol > 0) {
          changed = true;
          focusedCol -= 1;
        }
      } else if (e.key === 'ArrowRight') {
        if (focusedCol < columns.length - 1) {
          changed = true;
          focusedCol += 1;
        }
      } else if (e.key === 'ArrowUp') {
        if (focusedRow > 0) {
          changed = true;
          focusedRow -= 1;
        }
      } else if (e.key === 'ArrowDown') {
        if (focusedRow < rtState.endRow + this.extraHeaderRowCount) {
          changed = true;
          focusedRow += 1;
        }
      } else if (e.key === 'Home') {
        if (e.ctrlKey) {
          if (focusedRow !== 0) {
            changed = true;
            focusedRow = 0;
          }
        }
        if (focusedCol !== 0) {
          changed = true;
          focusedCol = 0;
        }
      } else if (e.key === 'End') {
        if (e.ctrlKey) {
          if (focusedRow !== rtState.endRow + this.extraHeaderRowCount) {
            changed = true;
            focusedRow = rtState.endRow + this.extraHeaderRowCount;
          }
        }
        if (focusedCol !== columns.length - 1) {
          changed = true;
          focusedCol = columns.length - 1;
        }
      } else if (e.key === 'PageUp') {
        if (focusedRow !== 0) {
          changed = true;
          focusedRow = 0;
        }
      } else if (e.key === 'PageDown') {
        if (focusedRow !== rtState.endRow + this.extraHeaderRowCount) {
          changed = true;
          focusedRow = rtState.endRow + this.extraHeaderRowCount;
        }
      } else if (e.key === 'Enter') {
        e.target.click();
      }

      if (changed) {
        e.preventDefault();

        const nodes = document.querySelectorAll(`[data-row="${focusedRow}"][data-col="${getColumnId(columns[focusedCol])}"][data-parent="${this.props.tableId}"]`);
        if (nodes[0]) {
          nodes[0].focus();
        }
      }
    };

    isFocused = (rtState, row, column) => this.isFocused(rtState, row, getColumnId(column));

    isFocusedColId = (rtState, row, columnId) => {
      const focusedRow = this.state.focused.row;
      const focusedCol = this.state.focused.column;

      // TODO Going to have to cache the visible columns...
      return focusedRow === row && getColumnId(rtState.allVisibleColumns[focusedCol]) === columnId;
    };

    getCustomTableProps = () => {
      const props = {
        role: 'grid',
      };

      if (this.props.ariaLabel) {
        props['aria-label'] = this.props.ariaLabel;
      } else if (this.props.ariaLabelledBy) {
        props['aria-labelledby'] = this.props.ariaLabelledBy;
      }

      if (this.props.ariaDescribedBy) {
        props['aria-describedby'] = this.props.ariaDescribedBy;
      }

      return props;
    };

    getCustomTheadThProps = (state, rowInfo, column) => {
      const { sorted } = this.state;

      // Determine sorted attribute
      let ariaSort;
      if (sorted && column.id === sorted.id) {
        ariaSort = (sorted.desc ? 'descending' : 'ascending');
      } else {
        ariaSort = 'none';
      }

      return {
        'aria-sort': ariaSort,
        role: 'columnheader',
        tabIndex: this.isFocused(state, 0, column) ? 0 : -1,
        'data-row': 0,
        'data-col': getColumnId(column),
        'data-parent': this.props.tableId,
        onFocus: this.onFocus(state, 0, column),
        onKeyDown: this.onKeyDown(state),
      };
    };

    getCustomTheadFilterThProps = (state, rowInfo, column) => ({
      role: 'columnheader', // TODO proper role here?
      tabIndex: this.isFocused(state, 1, column) ? 0 : -1,
      'data-row': 1,
      'data-col': getColumnId(column),
      'data-parent': this.props.tableId,
      onFocus: this.onFocus(state, 1, column),
      onKeyDown: this.onKeyDown(state),
    });

    getCustomTdProps = (state, rowInfo, column) => {
      if (rowInfo) {
        const focusable = this.isFocused(state, rowInfo.viewIndex + 1 + this.extraHeaderRowCount, column);
        return ({
          focusable,
          role: 'gridcell',
          tabIndex: focusable && !this.state.focused.managedByChild ? 0 : -1,
          'data-row': rowInfo.viewIndex + 1 + this.extraHeaderRowCount,
          'data-col': getColumnId(column),
          'data-parent': this.props.tableId,
          onFocus: this.onFocus(state, rowInfo.viewIndex + 1 + this.extraHeaderRowCount, column),
          onKeyDown: this.onKeyDown(state),
          onFocus2: (e) => {
            console.log(e);
          },
        });
      }
      return {};
    };

    contextualizeCell = (columnId, cellRenderer) => {
      if (cellRenderer) {
        return (row) => {
          // cell renderer row index has to account for header rows
          const focusable = this.isFocusedColId(state, row.index + 1 + this.extraHeaderRowCount, columnId);
          return (
            <Provider value={{ nameAdder: () => { } }}>
              {cellRenderer(row)}
            </Provider>
          );
        };
      }
      return undefined;
    };

    contextualizeColumn = (column) => {
      let { id } = column;
      if (!id) {
        id = column.accessor;
      }
      return {
        ...column,
        Cell: this.contextualizeCell(id, column.Cell),
        columns: this.contextualizeColumns(column.columns),
      };
    };

    contextualizeColumns = (columns) => {
      if (columns) {
        return columns.map(this.contextualizeColumn);
      }
      return undefined;
    };

    render() {
      const newProps = { ...this.props };

      // Table parts that use stateless prop callbacks
      newProps.getTheadProps = mergeProps(getCustomTrGroupProps, this.props.getTheadProps);
      newProps.getTbodyProps = mergeProps(getCustomTrGroupProps, this.props.getTbodyProps);
      newProps.getTheadFilterProps = mergeProps(getCustomTrGroupProps, this.props.getTheadFilterProps);
      newProps.getTheadTrProps = mergeProps(getCustomTrProps, this.props.getTheadTrProps);
      newProps.getTheadFilterTrProps = mergeProps(getCustomTrProps, this.props.getTheadFilterTrProps);
      newProps.getTrProps = mergeProps(getCustomTrProps, this.props.getTrProps);

      // Table parts that use stateful prop callbacks
      newProps.getTableProps = mergeProps(this.getCustomTableProps, this.props.getTableProps);
      newProps.getTheadThProps = mergeProps(this.getCustomTheadThProps, this.props.getTheadThProps);
      newProps.getTheadFilterThProps = mergeProps(this.getCustomTheadFilterThProps, this.props.getTheadFilterThProps);
      newProps.getTdProps = mergeProps(this.getCustomTdProps, this.props.getTdProps);

      newProps.columns = this.contextualizeColumns(this.props.columns);

      // ... and renders the wrapped component with the fresh data!
      // Notice that we pass through any additional props
      return (
        <WrappedReactTable
          {...newProps}
          onSortedChange={this.onSortedChange}
        />
      );
    }
  }

  const myPropTypes = {
    tableId: PropTypes.string,
    ariaLabel: PropTypes.string,
    ariaLabelledBy: PropTypes.string,
    ariaDescribedBy: PropTypes.string,
  };

  const myDefaultProps = {
    tableId: namor.generate({ words: 2 }),
  };

  AccessibleReactTable.propTypes = { ...WrappedReactTable.propTypes, ...myPropTypes };
  AccessibleReactTable.defaultProps = { ...WrappedReactTable.defaultProps, ...myDefaultProps };

  return AccessibleReactTable;
}

export default accessibility(ReactTable);

import React from 'react';
import PropTypes from 'prop-types';
import mergeProps from 'merge-prop-functions';
import ReactTable from 'react-table';

const { Provider, Consumer } = React.createContext();

/**
 * Returns the id of the react-table column.
 * In the case of an expander column, which does not have an id, this will return 'rt-expandable'.
 *
 * @param {{id: string?, expander: boolean}} column The react-table column
 * @returns {string} The id of the column.
 */
const getColumnId = column => {
  if (column.id) {
    return column.id;
  }
  return column.expander && 'rt-expandable';
};

/**
 * A function for generating props for a table row group.
 *
 * @returns {{role: string}} The props object for a table row group.
 */
const getCustomTrGroupProps = () => ({
  role: 'rowgroup',
});

/**
 * A function for generating the props for a table row.
 *
 * @returns {{role: string}} The props object for a table row.
 */
const getCustomTrProps = () => ({
  role: 'row',
});

/**
 * Generates a randomized string that looks like a GUID and is unique enough for this library.
 *
 * As per top answer: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 *
 * @returns {string} a randomized mostly unique string
 */
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

/**
 * A stateless component for replacing the built in filter component of react-table with one that
 * obeys the WAI-ARIA grid pattern.
 */
const DefaultFilterRenderer = ({ filter, onChange }) => (
  <CellFocusWrapper>
    {(focusRef, focusable) => (
      <input
        type="text"
        tabIndex={focusable ? 0 : -1}
        style={{
          width: '100%',
        }}
        value={filter ? filter.value : ''}
        onChange={event => onChange(event.target.value)}
        ref={focusRef}
      />
    )}
  </CellFocusWrapper>
);

DefaultFilterRenderer.propTypes = {
  filter: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

/**
 * A higher order component function for adding accessibility features to a react-table table.
 *
 * @param {ReactTable} WrappedReactTable The table to wrap with accessibility features.
 * @returns {AccessibleReactTable} The wrapped table that can be used just like a ReactTable.
 */
export function accessibility(WrappedReactTable) {
  /**
   * A higher order component that adds accessibility features to a react-table table.
   *
   * This component has a single child which is the ReactTable being wrapped.
   *
   * This component adds a few additional props for accessibility purposes:
   * <ul>
   *   <li>tableId: String - a unique id for the table for labelling purposes. This is randomly
   *   generated by default.</li>
   *   <li>ariaLabel: String - to apply aria-label to the table.</li>
   *   <li>ariaLabelledBy: String - to apply aria-labelledby to the table</li>
   *   <li>ariaDescribedBy: String - to apply aria-describedby to the table</li>
   * </ul>
   */
  class AccessibleReactTable extends React.Component {
    /**
     * The id of the table which must be unique.
     * @type {string}
     */
    tableId = this.props.tableId || guid();

    /**
     * How many many extra rows to count as a header row. Notably, the filter row counts as a
     * header row.
     * @type {number}
     */
    extraHeaderRowCount = this.props.filterable ? 1 : 0;

    /**
     * The default state. This initially only indicates which cell will be focusable.
     * @type {{focused: {row: number, column: number}}}
     */
    state = {
      focused: {
        row: 1 + this.extraHeaderRowCount,
        column: 0,
        columnId: undefined,
      },
    };

    /**
     * Called when the ReactTable is sorted. Updates the state to indicate which column is sorted on.
     * @param {array} sorted An array of the sorted columns.
     */
    onSortedChange = sorted => {
      // Store the react-table sorted data in this components state.
      this.setState({
        sorted: sorted[0],
      });
    };

    /**
     * A function for creating a focus handler function for a table cell.
     *
     * @param {{allVisibleColumns: {array}}} rtState The state object of the ReactTable
     * @param {number} rowIndex The cell's row index.
     * @param {{id: string, expander: boolean}} column The cell's column.
     * @returns {Function} The focus handler function for a table cell.
     */
    onFocus = (rtState, rowIndex, column) => () => {
      const columnId = getColumnId(column);
      const newFocused = {
        row: rowIndex,
        column: rtState.allVisibleColumns.findIndex(c => getColumnId(c) === columnId),
        columnId,
      };

      this.setState({
        focused: newFocused,
      });
    };

    /**
     * A function for creating a key down handler function for a table cell.
     *
     * @param {{allVisibleColumns: {array}, endRow: {number}}} rtState The state object of the
     * ReactTable
     * @returns {Function} The key down handler function for a table cell.
     */
    onKeyDown = rtState => e => {
      const columns = rtState.allVisibleColumns;
      let focusedCol = this.state.focused.column;
      let focusedRow = this.state.focused.row;

      // When an appropriate key is pressed, the focused column and/or row index is updated appropriately
      // Except in the case of Enter which simply simulates a click on the cell.

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
        // Most upper left cell
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
        // Most bottom right cell
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
        // Top most cell of current column
        if (focusedRow !== 0) {
          changed = true;
          focusedRow = 0;
        }
      } else if (e.key === 'PageDown') {
        // Bottom most cell of current column
        if (focusedRow !== rtState.endRow + this.extraHeaderRowCount) {
          changed = true;
          focusedRow = rtState.endRow + this.extraHeaderRowCount;
        }
      } else if (e.key === 'Enter') {
        e.target.click();
      }

      if (changed) {
        // If an focused index change occurs, cancel the normal key behavior and focus the new cell.
        e.preventDefault();

        const nodes = document.querySelectorAll(
          `[data-row="${focusedRow}"][data-col="${getColumnId(
            columns[focusedCol]
          )}"][data-parent="${this.tableId}"]`
        );
        if (nodes[0]) {
          const focusableChildren = nodes[0].querySelectorAll('[data-innerfocus]');
          if (focusableChildren[0]) {
            // The cell is using inner focus via CellFocusWrapper so we should focus the wrapper
            // instead of the cell itself.
            focusableChildren[0].focus();
          } else {
            nodes[0].focus();
          }
        }
      }
    };

    /**
     * Checks whether a cell is focusable based on the given row and column.
     *
     * @param {{allVisibleColumns: {array}}} rtState The state object of the ReactTable.
     * @param {number} row The cell's row index.
     * @param {{id: string, expander: boolean}} column The cell's column.
     * @returns {boolean} True if the cell is focusable, otherwise false.
     */
    isFocused = (rtState, row, column) => this.isFocusedColId(rtState, row, getColumnId(column));

    /**
     * Checks whether a cell is focusable based on the given row and column id.
     *
     * @param {{allVisibleColumns: {array}}} rtState The state object of the ReactTable.
     * @param {number} row The cell's row index.
     * @param {string} columnId The cell's column id.
     * @returns {boolean} True if the cell is focusable, otherwise false.
     */
    isFocusedColId = (rtState, row, columnId) => {
      const focusedRow = this.state.focused.row;
      const focusedCol = this.state.focused.column;

      // The column id must be converted from the id string to an index value
      return focusedRow === row && getColumnId(rtState.allVisibleColumns[focusedCol]) === columnId;
    };

    /**
     * A function for generating props for a table.
     *
     * @returns {{role: string, 'aria-label': string?, 'aria-labelledby': string?, 'aria-describedby': string?}}
     * The props object for a table.
     */
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

    /**
     * A function for generating props for a table head header.
     *
     * @param {{allVisibleColumns: {array}}} state The state object of the ReactTable component.
     * @param {object} rowInfo Not used.
     * @param {{id: string, expander: boolean}} column The header's column object.
     * @returns {{'aria-sort': string, role: string, tabIndex: number, 'data-row': number, 'data-col': string, 'data-parent': string, onFocus: Function, onKeyDown: Function}}
     * A props object for a table head header.
     */
    getCustomTheadThProps = (state, rowInfo, column) => {
      const { sorted } = this.state;

      // Determine sorted attribute
      let ariaSort;
      if (sorted && column.id === sorted.id) {
        ariaSort = sorted.desc ? 'descending' : 'ascending';
      } else {
        ariaSort = 'none';
      }

      return {
        'aria-sort': ariaSort,
        role: 'columnheader',
        tabIndex: this.isFocused(state, 0, column) ? 0 : -1,
        'data-row': 0,
        'data-col': getColumnId(column),
        'data-parent': this.tableId,
        onFocus: this.onFocus(state, 0, column),
        onKeyDown: this.onKeyDown(state),
      };
    };

    /**
     * A function for generating props for a table head filter header.
     *
     * @param {{allVisibleColumns: {array}}} state The state object of the ReactTable component.
     * @param {object} rowInfo Not used.
     * @param {{id: string, expander: boolean}} column The header's column object.
     * @returns {{role: string, tabIndex: number, 'data-row': number, 'data-col': string, 'data-parent': string, onFocus: Function, onKeyDown: Function}}
     * A props object for a table head filter header.
     */
    getCustomTheadFilterThProps = (state, rowInfo, column) => {
      const focusable = this.isFocused(state, 1, column);
      return {
        'data-focusable': focusable,
        role: 'columnheader', // TODO proper role here?
        tabIndex: undefined,
        'data-row': 1,
        'data-col': getColumnId(column),
        'data-parent': this.tableId,
        onFocus: this.onFocus(state, 1, column),
        onKeyDown: this.onKeyDown(state),
      };
    };

    /**
     * A function for generating props for a table cell.
     * Notably, it is possible for rowInfo to be undefined, in which case this returns an empty object.
     *
     * @param {{allVisibleColumns: {array}}} state The state object of the ReactTable component.
     * @param {{viewIndex: number}?} rowInfo The cell's row info object.
     * @param {{id: string, expander: boolean}} column The cell's column object.
     * @returns {{role: string, tabIndex: number, 'data-row': number, 'data-col': string, 'data-parent': string, onFocus: Function, onKeyDown: Function}}
     * A props object for a table cell. Possibly an empty object if no rowInfo is given.
     */
    getCustomTdProps = (state, rowInfo, column) => {
      if (rowInfo) {
        const focusable = this.isFocused(
          state,
          rowInfo.viewIndex + 1 + this.extraHeaderRowCount,
          column
        );
        let tabIndex = focusable ? 0 : -1;
        if (column.innerFocus) {
          tabIndex = undefined;
        }
        return {
          'data-focusable': focusable,
          role: 'gridcell',
          tabIndex,
          'data-row': rowInfo.viewIndex + 1 + this.extraHeaderRowCount,
          'data-col': getColumnId(column),
          'data-parent': this.tableId,
          onFocus: this.onFocus(state, rowInfo.viewIndex + 1 + this.extraHeaderRowCount, column),
          onKeyDown: this.onKeyDown(state),
        };
      }
      return {};
    };

    contextualizeCell = (columnId, cellRenderer) => row => (
      <Provider
        value={{
          focusable: row.tdProps.rest['data-focusable'],
        }}
      >
        {cellRenderer ? cellRenderer(row) : row.value}
      </Provider>
    );

    contextualizeFilter = (columnId, filterRenderer) => row => (
      <Provider
        value={{
          focusable: this.state.focused.columnId === columnId && this.state.focused.row === 1,
        }}
      >
        {filterRenderer ? filterRenderer(row) : DefaultFilterRenderer(row)}
      </Provider>
    );

    contextualizeColumn = column => {
      let { id } = column;
      if (!id) {
        id = column.accessor;
      }
      if (column.columns) {
        return {
          ...column,
          columns: this.contextualizeColumns(column.columns),
        };
      } else {
        return {
          ...column,
          Cell: this.contextualizeCell(id, column.Cell),
          Filter: this.contextualizeFilter(id, column.Filter),
        };
      }
    };

    contextualizeColumns = columns => {
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
      newProps.getTheadFilterProps = mergeProps(
        getCustomTrGroupProps,
        this.props.getTheadFilterProps
      );
      newProps.getTheadTrProps = mergeProps(getCustomTrProps, this.props.getTheadTrProps);
      newProps.getTheadFilterTrProps = mergeProps(
        getCustomTrProps,
        this.props.getTheadFilterTrProps
      );
      newProps.getTrProps = mergeProps(getCustomTrProps, this.props.getTrProps);

      // Table parts that use stateful prop callbacks
      newProps.getTableProps = mergeProps(this.getCustomTableProps, this.props.getTableProps);
      newProps.getTheadThProps = mergeProps(this.getCustomTheadThProps, this.props.getTheadThProps);
      newProps.getTheadFilterThProps = mergeProps(
        this.getCustomTheadFilterThProps,
        this.props.getTheadFilterThProps
      );
      newProps.getTdProps = mergeProps(this.getCustomTdProps, this.props.getTdProps);

      newProps.columns = this.contextualizeColumns(this.props.columns);

      // ... and renders the wrapped component with the fresh data!
      // Notice that we pass through any additional props
      // TODO: combine the onSortedChange function with any from user
      return <WrappedReactTable {...newProps} onSortedChange={this.onSortedChange} />;
    }
  }

  const myPropTypes = {
    tableId: PropTypes.string,
    ariaLabel: PropTypes.string,
    ariaLabelledBy: PropTypes.string,
    ariaDescribedBy: PropTypes.string,
  };

  AccessibleReactTable.propTypes = { ...WrappedReactTable.propTypes, ...myPropTypes };

  return AccessibleReactTable;
}

/**
 * A component for wrapping the contents in a cell renderer when contents contain elements that
 * can take focus.
 */
export class CellFocusWrapper extends React.Component {
  thisRef = React.createRef();
  focusRef = React.createRef();

  onCellFocus = e => {
    if (e.target === this.thisRef.current) {
      e.preventDefault();
      e.stopPropagation();
      this.focusRef.current.focus();
    }
  };

  render() {
    const { Component } = this.props;
    return (
      <Consumer>
        {({ focusable }) => (
          <Component tabIndex="-1" data-innerfocus onFocus={this.onCellFocus} ref={this.thisRef}>
            {this.props.children(this.focusRef, focusable)}
          </Component>
        )}
      </Consumer>
    );
  }
}

CellFocusWrapper.propTypes = {
  Component: PropTypes.node,
  children: PropTypes.func.isRequired,
};

CellFocusWrapper.defaultProps = {
  Component: 'div',
};

/**
 * A pre-wrapped AccessibleReactTable.
 * This cannot be used multiple times in the same page. Instead, the HOC accessibility function must be used.
 */
export default accessibility(ReactTable);

import expect from 'expect';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import { AccessibleReactTable } from '../src/';

describe('AccessibleReactTable', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div');
  });

  afterEach(() => {
    unmountComponentAtNode(node);
  });

  it('displays a welcome message', () => {
    render(<AccessibleReactTable />, node, () => {
      expect(node.innerHTML).toContain('Welcome to React components');
    });
  });
});

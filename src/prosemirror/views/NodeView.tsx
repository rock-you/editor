/* eslint-disable max-classes-per-file */
import React from 'react';
import { render } from 'react-dom';
import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { ThemeProvider } from '@material-ui/core';
import { Provider } from 'react-redux';
import { isEditable } from '../plugins/editable';
import { opts, ref } from '../../connect';
import { NodeViewProps } from './types';

class ReactWrapper {
  dom: HTMLElement;

  node: Node;

  view: EditorView;

  editor: null | React.Component = null;

  getPos: (() => number);

  constructor(
    NodeView: React.ComponentClass<NodeViewProps, any>,
    node: Node,
    view: EditorView,
    getPos: (() => number),
  ) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.dom = document.createElement('div');

    render(
      <ThemeProvider theme={opts.theme}>
        <Provider store={ref.store()}>
          <NodeView
            {...{
              node, view, getPos,
            }}
            ref={(r) => { this.editor = r; }}
          />
        </Provider>
      </ThemeProvider>,
      this.dom,
      async () => {
        this.editor?.setState({ ...node.attrs });
      },
    );
  }

  selectNode() {
    const edit = isEditable(this.view.state);
    this.editor?.setState({ open: this.view.hasFocus(), edit });
  }

  deselectNode() {
    const edit = isEditable(this.view.state);
    this.editor?.setState({ open: false, edit });
  }

  update(node: Node) {
    if (!node.sameMarkup(this.node)) return false;
    this.node = node;
    const edit = isEditable(this.view.state);
    this.editor?.setState({ edit, ...node.attrs });
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  destroy() {
    // TODO: Delete the actual image that was uploaded?
  }
}

function createNodeView(Editor: React.ComponentClass<NodeViewProps, any>) {
  return (node: Node, view: EditorView, getPos: boolean | (() => number)) => (
    new ReactWrapper(Editor, node, view, getPos as (() => number))
  );
}

export default createNodeView;

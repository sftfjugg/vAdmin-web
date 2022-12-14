module.exports = {
  getDefaultCfg() {
    return {
      trigger: 'mouseenter', // 可选 mouseenter || click
      activeState: 'active',
      inactiveState: 'inactive',
      resetSelected: false,
      shouldUpdate() { return true }
    }
  },
  getEvents() {
    if (this.get('trigger') === 'mouseenter') {
      return {
        'node:mouseenter': 'setAllItemStates',
        'node:mouseleave': 'clearAllItemStates'
      }
    }
    return {
      'node:click': 'setAllItemStates',
      'canvas:click': 'clearAllItemStates'
    }
  },
  setAllItemStates(e) {
    const graph = this.get('graph')
    const item = e.item
    this.item = item
    if (!this.shouldUpdate(e.item, { event: e, action: 'activate' })) {
      return
    }
    const self = this
    const activeState = this.get('activeState')
    const inactiveState = this.get('inactiveState')
    const autoPaint = graph.get('autoPaint')
    graph.setAutoPaint(false)
    graph.getNodes().forEach(function(node) {
      const hasSelected = node.hasState('selected')
      if (self.resetSelected) {
        if (hasSelected) {
          graph.setItemState(node, 'selected', false)
        }
      }
      graph.setItemState(node, activeState, false)
      inactiveState && graph.setItemState(node, inactiveState, true)
    })
    graph.getEdges().forEach(function(edge) {
      graph.setItemState(edge, activeState, false)
      inactiveState && graph.setItemState(edge, inactiveState, true)
    })
    inactiveState && graph.setItemState(item, inactiveState, false)
    graph.setItemState(item, activeState, true)
    graph.getEdges().forEach(function(edge) {
      if (edge.getSource() === item) {
        const target = edge.getTarget()
        const hasSelected = target.hasState('selected')
        if (self.resetSelected) {
          // inactiveState && graph.setItemState(target, inactiveState, false);
          // graph.setItemState(target, activeState, true);
          if (hasSelected) {
            graph.setItemState(target, 'selected', false)
          }
        }
        inactiveState && graph.setItemState(target, inactiveState, false)
        graph.setItemState(target, activeState, true)
        graph.setItemState(edge, activeState, true)
        graph.setItemState(edge, inactiveState, false)
        edge.toFront()
      } else if (edge.getTarget() === item) {
        // inactiveState && graph.setItemState(edge.getSource(), inactiveState, false);
        // graph.setItemState(edge.getSource(), activeState, true);

        const source = edge.getSource()
        const hasSelected = source.hasState('selected')
        if (self.resetSelected) {
          if (hasSelected) {
            graph.setItemState(source, 'selected', false)
          }
        }

        inactiveState && graph.setItemState(source, inactiveState, false)
        graph.setItemState(source, activeState, true)
        graph.setItemState(edge, activeState, true)
        graph.setItemState(edge, inactiveState, false)
        edge.toFront()
      }
    })
    graph.paint()
    graph.setAutoPaint(autoPaint)
    graph.emit('afteractivaterelations', { item: e.item, action: 'activate' })
  },
  clearAllItemStates(e) {
    const graph = this.get('graph')
    if (!this.shouldUpdate(e.item, { event: e, action: 'deactivate' })) {
      return
    }
    const self = this
    const autoPaint = graph.get('autoPaint')
    graph.setAutoPaint(false)
    graph.getNodes().forEach(function(node) {
      const hasSelected = node.hasState('selected')
      graph.clearItemStates(node)
      if (hasSelected) {
        graph.setItemState(node, 'selected', !self.resetSelected)
      }
    })
    graph.getEdges().forEach(function(edge) {
      graph.clearItemStates(edge)
    })
    graph.paint()
    graph.setAutoPaint(autoPaint)
    graph.emit('afteractivaterelations', { item: e.item || this.item, action: 'deactivate' })
  }
}

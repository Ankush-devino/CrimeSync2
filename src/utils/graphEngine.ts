import type { CrimeNode, CrimeEdge, DisruptionMetrics } from '../types/blastRadius';

/**
 * CHECK 1: BFS Traversal & Cycle Protection
 * Executes a strict queue-based BFS tracking a visited Set of node IDs.
 * Guarantees shortest hop path, safe cycle prevention, and bounds exploration strictly to maxHops.
 */
export function computeBlastRadius(
  allNodes: CrimeNode[],
  allEdges: CrimeEdge[],
  originId: string,
  maxHops: number = 3
): {
  nodes: CrimeNode[];
  edges: CrimeEdge[];
  nodesByHop: Map<number, CrimeNode[]>;
} {
  if (!allNodes || allNodes.length === 0) {
    return {
      nodes: [],
      edges: [],
      nodesByHop: new Map(),
    };
  }

  // Fallback to first node if originId is invalid
  const resolvedOriginId = allNodes.some((n) => n.id === originId)
    ? originId
    : allNodes[0].id;

  const nodeMap = new Map<string, CrimeNode>(allNodes.map((n) => [n.id, { ...n }]));
  const adj = new Map<string, string[]>();

  // Initialize adjacency list for all nodes
  allNodes.forEach((n) => adj.set(n.id, []));

  // Build undirected adjacency graph for bidirectional criminal reach
  allEdges.forEach((e) => {
    if (adj.has(e.source) && adj.has(e.target)) {
      adj.get(e.source)!.push(e.target);
      adj.get(e.target)!.push(e.source);
    }
  });

  // Shortest hop distance map & visited tracking
  const hopMap = new Map<string, number>();
  const queue: Array<{ id: string; hop: number }> = [];

  hopMap.set(resolvedOriginId, 0);
  queue.push({ id: resolvedOriginId, hop: 0 });

  while (queue.length > 0) {
    const { id, hop } = queue.shift()!;
    if (hop >= maxHops) continue;

    const neighbors = adj.get(id) || [];
    for (const neighborId of neighbors) {
      if (!hopMap.has(neighborId)) {
        hopMap.set(neighborId, hop + 1);
        queue.push({ id: neighborId, hop: hop + 1 });
      }
    }
  }

  // Organize reachable nodes by hop level
  const reachableNodes: CrimeNode[] = [];
  const nodesByHop = new Map<number, CrimeNode[]>();

  for (let h = 0; h <= maxHops; h++) {
    nodesByHop.set(h, []);
  }

  for (const [nodeId, hopLevel] of hopMap.entries()) {
    if (nodeMap.has(nodeId)) {
      const node = nodeMap.get(nodeId)!;
      const updatedNode: CrimeNode = {
        ...node,
        hop: hopLevel,
      };
      reachableNodes.push(updatedNode);
      nodesByHop.get(hopLevel)?.push(updatedNode);
    }
  }

  // Sort nodes by hop level (Hop 0 first, then 1, 2, 3)
  reachableNodes.sort((a, b) => a.hop - b.hop);

  // Filter edges where BOTH source and target are reachable within maxHops
  const reachableIdSet = new Set(reachableNodes.map((n) => n.id));
  const reachableEdges = allEdges.filter(
    (e) => reachableIdSet.has(e.source) && reachableIdSet.has(e.target)
  );

  return {
    nodes: reachableNodes,
    edges: reachableEdges,
    nodesByHop,
  };
}

/**
 * CHECK 5: Disruption Rate Logic & Reactive Edge Severing
 * Disruption % = (Severed Pipeline Weights / Total Active Pipeline Weights) * 100
 */
export function calculateDisruption(
  nodes: CrimeNode[],
  edges: CrimeEdge[],
  containedNodeIds: Set<string> | string[]
): DisruptionMetrics {
  const containedSet =
    containedNodeIds instanceof Set ? containedNodeIds : new Set(containedNodeIds);
  const totalEdgeCount = edges.length;
  const totalNodeCount = nodes.length;

  if (totalEdgeCount === 0 || totalNodeCount === 0) {
    return {
      disruptionRate: 0,
      severedEdgeCount: 0,
      totalEdgeCount: 0,
      containedNodeCount: containedSet.size,
      totalNodeCount: 0,
      isolatedNodeCount: 0,
      frozenAssetsValue: 0,
      activeContagionPaths: 0,
    };
  }

  let severedEdgeCount = 0;
  let totalEdgeWeight = 0;
  let severedEdgeWeight = 0;

  edges.forEach((edge) => {
    const w = edge.weight > 0 ? edge.weight : 50; // default weight if 0
    totalEdgeWeight += w;
    if (containedSet.has(edge.source) || containedSet.has(edge.target)) {
      severedEdgeCount++;
      severedEdgeWeight += w;
    }
  });

  // Calculate disruption percentage strictly: (severedWeight / totalWeight) * 100
  let disruptionRate = 0;
  if (totalEdgeWeight > 0) {
    disruptionRate = Math.min(100, Math.round((severedEdgeWeight / totalEdgeWeight) * 100));
  }

  // Calculate isolated nodes that have zero active unsevered connections back to network
  const activeEdges = edges.filter(
    (e) => !containedSet.has(e.source) && !containedSet.has(e.target)
  );

  const activeConnectedNodes = new Set<string>();
  activeEdges.forEach((e) => {
    activeConnectedNodes.add(e.source);
    activeConnectedNodes.add(e.target);
  });

  let isolatedNodeCount = 0;
  nodes.forEach((node) => {
    if (!containedSet.has(node.id) && node.hop > 0 && !activeConnectedNodes.has(node.id)) {
      isolatedNodeCount++;
    }
  });

  // Estimate frozen illicit assets
  let frozenAssetsValue = 0;
  nodes.forEach((node) => {
    if (containedSet.has(node.id)) {
      if (node.details.amount) {
        const match = node.details.amount.match(/₹?([\d,.]+)\s*(Cr|Crore|Lakh|L)/i);
        if (match) {
          const num = parseFloat(match[1].replace(/,/g, ''));
          const unit = match[2].toLowerCase();
          if (unit.startsWith('cr')) frozenAssetsValue += num * 10000000;
          else if (unit.startsWith('l')) frozenAssetsValue += num * 100000;
        } else {
          frozenAssetsValue += 5000000;
        }
      } else if (node.type === 'account') {
        frozenAssetsValue += 2500000;
      }
    }
  });

  return {
    disruptionRate,
    severedEdgeCount,
    totalEdgeCount,
    containedNodeCount: containedSet.size,
    totalNodeCount,
    isolatedNodeCount,
    frozenAssetsValue,
    activeContagionPaths: Math.max(0, totalEdgeCount - severedEdgeCount),
  };
}

/**
 * CHECK 2: Radial Geometry & Overlap Prevention
 * Distributes nodes evenly along concentric circles around dynamic center (cx, cy)
 * with angular phase offsets per hop to prevent straight spoke alignments and overlap.
 */
export function calculatePolarCoordinates(
  nodesByHop: Map<number, CrimeNode[]>,
  centerX: number = 400,
  centerY: number = 400,
  hopRadii: number[] = [0, 120, 230, 335]
): Map<string, { x: number; y: number; angle: number; hop: number }> {
  const coords = new Map<string, { x: number; y: number; angle: number; hop: number }>();

  nodesByHop.forEach((hopNodes, hopLevel) => {
    const radius = hopRadii[hopLevel] !== undefined ? hopRadii[hopLevel] : hopLevel * 110;
    const n = hopNodes.length;

    if (hopLevel === 0 || n === 0) {
      if (hopNodes[0]) {
        coords.set(hopNodes[0].id, {
          x: centerX,
          y: centerY,
          angle: 0,
          hop: 0,
        });
      }
      return;
    }

    if (n === 1) {
      // Single node placed at top
      const angle = -Math.PI / 2;
      coords.set(hopNodes[0].id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        angle,
        hop: hopLevel,
      });
      return;
    }

    // Dynamic angle step: 2*PI / n
    const angleStep = (2 * Math.PI) / n;
    // Phase offset per hop level to prevent awkward overlapping spoke lines
    const phaseOffset = hopLevel * 0.35 - Math.PI / 2;

    hopNodes.forEach((node, idx) => {
      const angle = idx * angleStep + phaseOffset;
      const x = Math.round(centerX + radius * Math.cos(angle));
      const y = Math.round(centerY + radius * Math.sin(angle));
      coords.set(node.id, { x, y, angle, hop: hopLevel });
    });
  });

  return coords;
}

/**
 * Centrality scoring helper to return the top most influential connectors.
 */
export function getCentralityRankings(
  nodes: CrimeNode[],
  edges: CrimeEdge[]
): Array<{ node: CrimeNode; degree: number; financialVolume: string }> {
  const degreeMap = new Map<string, number>();
  nodes.forEach((n) => degreeMap.set(n.id, 0));

  edges.forEach((e) => {
    if (degreeMap.has(e.source)) degreeMap.set(e.source, degreeMap.get(e.source)! + 1);
    if (degreeMap.has(e.target)) degreeMap.set(e.target, degreeMap.get(e.target)! + 1);
  });

  return nodes
    .map((node) => ({
      node,
      degree: degreeMap.get(node.id) || 0,
      financialVolume: node.details.amount || 'N/A',
    }))
    .sort((a, b) => b.degree - a.degree);
}

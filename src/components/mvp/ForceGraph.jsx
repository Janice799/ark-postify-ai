'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const NODE_COLORS = {
  Person: { bg: '#8B5CF6', text: '#FFFFFF', border: '#A78BFA' },       // Violet
  Organization: { bg: '#3B82F6', text: '#FFFFFF', border: '#60A5FA' }, // Blue
  Project: { bg: '#10B981', text: '#FFFFFF', border: '#34D399' },      // Emerald
  Event: { bg: '#F59E0B', text: '#FFFFFF', border: '#FBBF24' },        // Amber
  Concept: { bg: '#EC4899', text: '#FFFFFF', border: '#F472B6' },      // Pink
  Location: { bg: '#06B6D4', text: '#FFFFFF', border: '#22D3EE' },     // Cyan
  Default: { bg: '#6B7280', text: '#FFFFFF', border: '#9CA3AF' }       // Gray
};

export const ForceGraph = ({ graphData, highlightedNodeIds = [] }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  // Keep physics state in refs to avoid React re-render lags
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const dragNodeRef = useRef(null);
  const panStartRef = useRef(null);
  const isPanningRef = useRef(false);
  const mouseWorldPosRef = useRef({ x: 0, y: 0 });

  // Sync graphData with physics engine
  useEffect(() => {
    if (!graphData || !graphData.nodes) return;

    const currentNodes = [...nodesRef.current];
    const nodeMap = new Map(currentNodes.map(n => [n.id, n]));

    // Reconstruct nodes, keeping positions of existing ones
    const newNodes = graphData.nodes.map(n => {
      const existing = nodeMap.get(n.id);
      return {
        ...n,
        x: existing ? existing.x : (Math.random() - 0.5) * 200 + 400,
        y: existing ? existing.y : (Math.random() - 0.5) * 200 + 300,
        vx: existing ? existing.vx : 0,
        vy: existing ? existing.vy : 0,
        radius: 35
      };
    });

    // Reconstruct links with node objects
    const newLinks = (graphData.links || []).map(l => {
      const sourceNode = newNodes.find(n => n.id === l.source || n.id === (l.source?.id));
      const targetNode = newNodes.find(n => n.id === l.target || n.id === (l.target?.id));
      return {
        ...l,
        sourceNode,
        targetNode
      };
    }).filter(l => l.sourceNode && l.targetNode);

    nodesRef.current = newNodes;
    linksRef.current = newLinks;
  }, [graphData]);

  // Reset zoom & pan to fit graph
  const handleReset = () => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setZoom(1);
    setPan({ x: width / 2 - 400, y: height / 2 - 300 });
  };

  // Trigger initial centring when loaded
  useEffect(() => {
    setTimeout(handleReset, 100);
  }, []);

  // Main animation / physics loop
  useEffect(() => {
    let animationFrameId;

    const stepPhysics = () => {
      const nodes = nodesRef.current;
      const links = linksRef.current;
      if (nodes.length === 0) return;

      const kSpring = 0.04;
      const restLength = 160;
      const kRepel = 2400;
      const kGravity = 0.015;
      const decay = 0.88;

      // 1. Repulsive forces (Coulomb's Law)
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy + 1;
          const dist = Math.sqrt(distSq);

          if (dist < 400) {
            const force = kRepel / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (n1 !== dragNodeRef.current) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (n2 !== dragNodeRef.current) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }
      }

      // 2. Attractive forces (Springs)
      for (const link of links) {
        const n1 = link.sourceNode;
        const n2 = link.targetNode;
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - restLength) * kSpring;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (n1 !== dragNodeRef.current) {
          n1.vx += fx;
          n1.vy += fy;
        }
        if (n2 !== dragNodeRef.current) {
          n2.vx -= fx;
          n2.vy -= fy;
        }
      }

      // 3. Center gravity (pull to 400, 300)
      const centerX = 400;
      const centerY = 300;
      for (const node of nodes) {
        if (node === dragNodeRef.current) continue;
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.vx += dx * kGravity;
        node.vy += dy * kGravity;
      }

      // 4. Update positions with damping
      for (const node of nodes) {
        if (node === dragNodeRef.current) continue;
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= decay;
        node.vy *= decay;
      }
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const nodes = nodesRef.current;
      const links = linksRef.current;

      // Reset canvas transforms
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Background
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      ctx.beginPath();
      // Draw grid offset by pan
      const startX = pan.x % (gridSize * zoom);
      const startY = pan.y % (gridSize * zoom);
      for (let x = startX; x < canvas.width; x += gridSize * zoom) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = startY; y < canvas.height; y += gridSize * zoom) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Apply Zoom & Pan
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Determine active highlight mode
      const isAnyNodeHovered = hoveredNode !== null;
      const activeHighlightIds = new Set(highlightedNodeIds);

      // 1. Draw Links
      for (const link of links) {
        const s = link.sourceNode;
        const t = link.targetNode;

        const isLinkHighlighted = 
          (isAnyNodeHovered && (s.id === hoveredNode.id || t.id === hoveredNode.id)) ||
          (!isAnyNodeHovered && activeHighlightIds.has(s.id) && activeHighlightIds.has(t.id));

        const isLinkDimmed = isAnyNodeHovered && !isLinkHighlighted;

        ctx.strokeStyle = isLinkHighlighted 
          ? 'rgba(99, 102, 241, 0.85)' // Glow indigo
          : (isLinkDimmed ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.15)');
        
        ctx.lineWidth = isLinkHighlighted ? 2.5 : 1.5;

        // Draw line
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();

        // Draw Relationship Text Label
        if (!isLinkDimmed && (isLinkHighlighted || zoom > 0.65)) {
          const midX = (s.x + t.x) / 2;
          const midY = (s.y + t.y) / 2;
          
          ctx.save();
          ctx.translate(midX, midY);
          
          // Rotate text to match line angle
          let angle = Math.atan2(t.y - s.y, t.x - s.x);
          if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
            angle += Math.PI;
          }
          ctx.rotate(angle);

          // Draw small text background
          ctx.font = '10px sans-serif';
          const labelText = link.relation + (link.timestamp ? ` (${link.timestamp})` : '');
          const textWidth = ctx.measureText(labelText).width;
          
          ctx.fillStyle = 'rgba(10, 10, 12, 0.85)';
          ctx.fillRect(-textWidth / 2 - 4, -8, textWidth + 8, 14);

          ctx.fillStyle = isLinkHighlighted ? '#A5B4FC' : 'rgba(255, 255, 255, 0.5)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, 0, 0);
          ctx.restore();
        }
      }

      // 2. Draw Nodes
      for (const node of nodes) {
        const isHovered = hoveredNode && node.id === hoveredNode.id;
        const isNeighbor = hoveredNode && links.some(l => 
          (l.sourceNode.id === hoveredNode.id && l.targetNode.id === node.id) ||
          (l.targetNode.id === hoveredNode.id && l.sourceNode.id === node.id)
        );
        const isAISearched = activeHighlightIds.has(node.id);

        const isDimmed = isAnyNodeHovered && !isHovered && !isNeighbor;
        
        const colors = NODE_COLORS[node.type] || NODE_COLORS.Default;

        ctx.save();

        // Glow ring if hovered, neighbor, or highlighted by AI
        if (isHovered || isAISearched) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.bg;
        }

        // Draw pulsing outer ring for AI highlighted nodes
        if (isAISearched) {
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 2;
          ctx.beginPath();
          const pulseRadius = node.radius + 6 + Math.sin(Date.now() / 200) * 3;
          ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw Node Core Circle
        ctx.fillStyle = isDimmed ? 'rgba(30, 30, 35, 0.4)' : colors.bg;
        ctx.strokeStyle = isDimmed ? 'rgba(255,255,255,0.05)' : colors.border;
        ctx.lineWidth = isHovered ? 4 : 2;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0; // Reset shadow

        // Node Label Text
        ctx.fillStyle = isDimmed ? 'rgba(255,255,255,0.1)' : colors.text;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Truncate text if too long
        let label = node.label;
        if (ctx.measureText(label).width > node.radius * 2 - 10) {
          label = label.substring(0, 8) + '...';
        }
        ctx.fillText(label, node.x, node.y - 3);

        // Node Type Sub-label
        ctx.fillStyle = isDimmed ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)';
        ctx.font = '8px sans-serif';
        ctx.fillText(node.type.toUpperCase(), node.x, node.y + 11);

        ctx.restore();
      }
    };

    const runFrame = () => {
      stepPhysics();
      draw();
      animationFrameId = requestAnimationFrame(runFrame);
    };

    runFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [zoom, pan, hoveredNode, highlightedNodeIds]);

  // Resize canvas handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper to map screen coordinates to world coordinates
  const getWorldCoords = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return {
      x: (x - pan.x) / zoom,
      y: (y - pan.y) / zoom
    };
  };

  const handleMouseDown = (e) => {
    const coords = getWorldCoords(e.clientX, e.clientY);
    
    // Check if clicked a node
    const nodes = nodesRef.current;
    let clickedNode = null;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dx = coords.x - node.x;
      const dy = coords.y - node.y;
      if (dx * dx + dy * dy < node.radius * node.radius) {
        clickedNode = node;
        break;
      }
    }

    if (clickedNode) {
      dragNodeRef.current = clickedNode;
      // Anchor coordinates
      clickedNode.vx = 0;
      clickedNode.vy = 0;
    } else {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e) => {
    const coords = getWorldCoords(e.clientX, e.clientY);
    mouseWorldPosRef.current = coords;

    if (dragNodeRef.current) {
      dragNodeRef.current.x = coords.x;
      dragNodeRef.current.y = coords.y;
      dragNodeRef.current.vx = 0;
      dragNodeRef.current.vy = 0;
    } else if (isPanningRef.current && panStartRef.current) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
    } else {
      // Find hovered node
      const nodes = nodesRef.current;
      let currentHover = null;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        const dx = coords.x - node.x;
        const dy = coords.y - node.y;
        if (dx * dx + dy * dy < node.radius * node.radius) {
          currentHover = node;
          break;
        }
      }
      if (hoveredNode?.id !== currentHover?.id) {
        setHoveredNode(currentHover);
      }
    }
  };

  const handleMouseUp = () => {
    dragNodeRef.current = null;
    isPanningRef.current = false;
    panStartRef.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    
    // Clamp zoom
    const clampedZoom = Math.max(0.15, Math.min(3, newZoom));
    
    // Adjust pan so zoom centers on mouse position
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setPan(prev => ({
      x: mouseX - (mouseX - prev.x) * (clampedZoom / zoom),
      y: mouseY - (mouseY - prev.y) * (clampedZoom / zoom)
    }));
    
    setZoom(clampedZoom);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full rounded-2xl overflow-hidden border border-white/5 bg-[#0a0a0c]">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="block cursor-grab active:cursor-grabbing"
      />

      {/* Node Info / Tooltip Overlay */}
      {hoveredNode && (
        <div className="absolute top-4 left-4 p-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl max-w-xs shadow-2xl animate-fade-in pointer-events-none select-none">
          <div className="flex items-center gap-2 mb-1.5">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: (NODE_COLORS[hoveredNode.type] || NODE_COLORS.Default).bg }} 
            />
            <h4 className="text-[13px] font-bold text-white leading-none">{hoveredNode.label}</h4>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/50 inline-block mb-2">
            {hoveredNode.type.toUpperCase()}
          </span>
          <p className="text-[11px] text-white/70 leading-relaxed">{hoveredNode.description}</p>
        </div>
      )}

      {/* Floating Canvas Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom(z => Math.min(3, z * 1.2))}
          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg backdrop-blur-md transition-all cursor-pointer shadow-lg"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.15, z / 1.2))}
          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg backdrop-blur-md transition-all cursor-pointer shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleReset}
          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg backdrop-blur-md transition-all cursor-pointer shadow-lg"
          title="Fit Canvas"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 p-2.5 bg-black/60 border border-white/5 rounded-xl text-[9px] flex gap-3 text-white/40 select-none">
        {Object.entries(NODE_COLORS).map(([type, color]) => {
          if (type === 'Default') return null;
          return (
            <div key={type} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.bg }} />
              <span>{type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

var template = `
<script src="https://use.fontawesome.com/346680d406.js"></script>
<style>

.steelblue {
  fill: steelblue;
  stroke: none;
}

.green {
  fill: green;
  stroke: none;
}

.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 1px;
}

div.tooltip {	
    position: absolute;			
    text-align: left;			
    width: 200px;					
    height: 50px;					
    padding: 2px;				
    font: 12px sans-serif;		
    background: lightsteelblue;	
    border: 0px;		
    border-radius: 8px;			
    pointer-events: none;			
}
</style>

  <svg width="500" height="300">
    <g transform="translate(5, 5)">
      <g class="links"></g>
      <g class="nodes"></g>
    </g>
  </svg>


  <script src="https://d3js.org/d3.v5.min.js"></script>
  <script>
var data = {{{response}}};

var treeLayout = d3.tree()
  .size([400, 200]);

const children = d => {
  if(d == null) {
    return null;
  }
  let rtn = d.data && (d.data.pods || d.data.pos || d.data.services || d.data.svcs || d.data.deployments || d.data.deploys || d.data.replicasets || d.data.rss || d.data.statefulsets || d.data.stss || d.data.daemonsets || d.data.dss);
  if(rtn) {
    return [rtn];
  }
  aliases = ['parent', 'mounting', 'connected', 'children', 'connecting', 'namespace', 'events'].filter(alias => d[alias] != null)
  // Label each children nodes with alias name
  aliases.forEach(alias => {
    d[alias].alias = alias;
  });
  rtn = aliases.map(alias => d[alias]);
  console.log(rtn);
  if(rtn.length) {
    return rtn;
  }
  if(d.length) {
    return d
  }
  if(d.items && d.items.length) {
    return d.items;
  }
  return null;
};

const getName = d => {
  // console.log(d);
  const data = d.data;
  return data.metadata && data.metadata.name;
}

const getIcon = d => {
  const data = d.data;
  const typeiconmap = {
    Pod: "\uf1b2",
    Service: "\uf0e8",
    Deployment: "\uf1b3",
    Secret: "\uf084",
    ConfigMap: "\uf15b",
    ReplicaSet: "\uf24d",
    Event: "\uf06a"
  };
  const aliasiconmap = {
    connected: "\uf148",
    connecting: "\uf149",
    mounting: "\uf115",
    parent: "\uf062",
    children: "\uf063",
    namespace: "\uf015",
    events: "\uf12a"
  };
  return typeiconmap[data.__typename] || aliasiconmap[data.alias] || "\uf128";
}

const getReourceDetails = d => {
  const data = d.data;
  let rtn = 'type: '+d.data.__typename+'<br/>';
  let name = data.metadata && data.metadata.name;
  if(name) {
    rtn = rtn + 'name: '+d.data.metadata.name;
  }
  let alias = data.alias;
  if(alias) {
    rtn = 'alias: '+alias+'<br/>'+rtn;
  }
  return rtn;
}

const getCircleClass = d => {
  const data = d.data;
  return data.alias ? "green" : "steelblue";
}

const showResource = tooltip => {
  return (d,i) => {
    tooltip.html(getReourceDetails(d))
               .style("left", (d3.event.pageX + 10) + "px")
               .style("top", (d3.event.pageY - 15) + "px");
    tooltip.transition()
      .duration('50')
      .style("opacity", 1);
  }
}
const hideResource = tooltip => {
  return (d,i) => {
    d3.select(this).text(getName(d));
    tooltip.transition()
      .duration('50')
      .style("opacity", 0);
  }
}

var root = d3.hierarchy(data, children);

var treeData = treeLayout(root).descendants()

var tooltip = d3.select("body").append("div")
     .attr("class", "tooltip")
     .style("opacity", 0);
d3.select("svg")
  .append("g")
  .attr("id", "treeG")
  .attr("transform", "translate(60,20)")
  .selectAll("g")
  .data(treeData)
  .enter()
  .append("g")
  .attr("class", "node")
  .attr("transform", d => 'translate('+d.x+','+d.y+')');

d3.selectAll("g.node")
  .append("circle")
  .attr("r", 15)
  .style("stroke", "white")
  .style("stroke-width", "2px")
  .attr("class", getCircleClass)
  .on('mouseover', showResource(tooltip))
  .on('mouseout', hideResource(tooltip));

d3.select("#treeG").selectAll("line")
  .data(treeData.filter(d => d.parent))
  .enter().insert("line","g")
  .attr("x1", d => d.parent.x)
  .attr("y1", d => d.parent.y)
  .attr("x2", d => d.x)
  .attr("y2", d => d.y)
  .style("stroke", "black");

d3.selectAll("g.node")
  .append("text")
  // .style("text-anchor", "middle")
  // .style("fill", "#4f442b")
  // .attr("transform", "rotate(30)")
  .attr('text-anchor', 'middle')
  .attr('dominant-baseline', 'central')
  .attr('font-family', 'FontAwesome')
  .attr('font-size', 15)
  .style("fill", "white")
  .text(getIcon)
  .on('mouseover', showResource(tooltip))
  .on('mouseout', hideResource(tooltip));
  </script>


`;
// Set visualizer
pm.visualizer.set(template, {
    // Pass the response body parsed as JSON as `data`
    response: JSON.stringify(pm.response.json())
});
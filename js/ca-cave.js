var allrules = [range(0,8), range(0,8)];
allrules[0] = applyFun(allrules[0], function(d,i){
	return { neighborhoodSum: d, state: d >= 5 ? 1 : 0 };
});
allrules[1] = applyFun(allrules[1], function(d,i){
	return { neighborhoodSum: d, state: d >= 4 ? 1 : 0 };
});


function randomizeCells() {
	for (var i=0; i<nrows; i++) {
		for (var j=0; j<ncols; j++) {
			cells[i][j].state = rbinom(prob);
		}
	}
}

function getNeighbors(r, c) {
	var neighbors = [];
	for (var i=-1; i<2; i++) {
		for (var j=-1; j<2; j++) {
			var row = r + i;
			var col = c + j;
			if (row === r && col === c){
				// center cell - ignore
			}
			else {
				// a neighbor - add to array
				neighbors.push([row,col]);
			}
		}
	}
	return neighbors;
}

function getNeighborhoodExtent(neighbors) {
	var rowExtent = d3.extent(neighbors.map(function(m){ return m[0]; }));
	var colExtent = d3.extent(neighbors.map(function(m){ return m[1]; }));

	rowExtent = clampAll(rowExtent, 0, nrows-1);
	colExtent = clampAll(colExtent, 0, ncols-1);

	return [rowExtent, colExtent];
}

function createCellCanvas(r,c) {
	var cell = {};
	cell.row = r;
	cell.col = c;
	cell.prevState = 0;
	cell.neighbors = getNeighbors(r, c);
	cell.neighborhoodExtent = getNeighborhoodExtent(cell.neighbors);

	cell.x = xscale(cell.col);
	cell.y = yscale(cell.row);
	cell.w = xscale.bandwidth();
	cell.h = yscale.bandwidth();

	return cell;
}

function createCellSVG(r,c) {
	var cell = {};
	cell.row = r;
	cell.col = c;
	cell.prevState = 0;
	cell.neighbors = getNeighbors(r, c);
	cell.neighborhoodExtent = getNeighborhoodExtent(cell.neighbors);

	var svgCell = svg.selectAll(".cell-datum").data([cell])
		.enter().append("rect")
			.attr("class", "cell-data cell-datum-" + cell.row + "-" + cell.col)
			.attr("x", xscale(cell.col) )
			.attr("y", yscale(cell.row) )
			.attr("width", xscale.bandwidth() )
			.attr("height", yscale.bandwidth() )
			.attr("fill", stateColors[0] )
			.attr("stroke", "#333")
			.attr("stroke-width", 0.2)
		.on("mouseover", function(d){
			console.log(d);
			var nExtent = d.neighborhoodExtent;
			var rowExtent = nExtent[0];
			var colExtent = nExtent[1];

			var overlayX = xscale(colExtent[0]);
			var overlayY = yscale(rowExtent[0]);
			var overlayW = xscale.bandwidth() * (colExtent[1] - colExtent[0] + 1);
			var overlayH = yscale.bandwidth() * (rowExtent[1] - rowExtent[0] + 1);

			overlay
					.attr("x", overlayX)
					.attr("y", overlayY)
					.attr("width", overlayW)
					.attr("height", overlayH)
					.attr("fill", "#ff9900")
					.attr("fill-opacity", 0.3)
					.attr("stroke", "#ff9900")
					.attr("stroke-width", 3);

			updateMooreOverlay(d);

			for (var i=0; i<d.neighbors.length; i++) {
				var nsvg = cells[d.neighbors[i][0]][d.neighbors[i][1]].svgCell;
				nsvg.attr("stroke", "#ff9900").attr("stroke-width", 1);
			}

		})
		.on("mouseout", function(d){
			d3.selectAll(".cell-data").attr("stroke", strokeColor ).attr("stroke-width", strokeWidth);
			overlay.attr("fill-opacity", 0).attr("stroke-width", 0);

			mooreOverlay.row.text("row");
			mooreOverlay.col.text("column");
			for (var i=0; i<3; i++) {
				for (var j=0; j<3; j++) {
					var m = mooreOverlay.matrix[i][j].attr("fill", stateColors[0]).attr("stroke", "#aaa");
				}
			}
			d3.select(".center-cell-text").attr("fill", stateColors[1]);
			mooreOverlay.currentState.style("opacity", 0);
			mooreOverlay.nextState.style("opacity", 0);
		});

	cell.svgCell = svgCell;
	
	return cell;
}


function getNextStates() {
	nextStates = [];
	for (var r=0; r<nrows; r++) {
		nextStates[r] = [];
		for (var c=0; c<ncols; c++) {
			nextStates[r][c] = applyRules(cells[r][c]);
		}
	}
	return nextStates;
}

function drawCells(type) {
	for (var r=0; r<nrows; r++) {
		for (var c=0; c<ncols; c++) {
			var cell = cells[r][c];

			if (type === "svg") 
				drawCellSVG(cell);
			else 
				drawCellCanvas(cell);
		}
	}
}

function drawCellSVG(cell) {
	cell.svgCell.attr("fill", stateColors[cell.state]);
}

function drawCellCanvas(cell) {
	context.beginPath();
	context.fillStyle = stateColors[cell.state];
	context.strokeStyle = strokeColor;
	context.lineWidth = strokeWidth;
	context.rect(cell.x, cell.y, cell.w, cell.h);
	context.fill();
	context.stroke();
}

function updateStep(type) {
	var nextStates = getNextStates();
	updateCells(nextStates);
	drawCells(type);
}


function updateCells(nextStates) {
	for (var r=0; r<nrows; r++) {
		for (var c=0; c<ncols; c++) {
			var cell = cells[r][c];
			cell.state = nextStates[r][c];
		}
	}
}

function applyRules(cell) {
	var state = cell.state;
	var wallsum = getNeighborhoodWallSum(cell);
	return getRuleState(state, wallsum);
}


function getRuleState(cellstate, wallsum) {
	var ruleset = allrules[cellstate];
	var rulesums = ruleset.map(function(m){ return m.neighborhoodSum; });
	var index = rulesums.indexOf(wallsum);

	var rulestates = ruleset.map(function(m){ return m.state; });

	return rulestates[index];
}

function getNeighborhoodWallSum(cell) {
	var wallTotal = 0;
	for (var i=0; i<cell.neighbors.length; i++) {
		var nLoc = cell.neighbors[i];
		// neighbor's row (nr) and col (nc)
		var nr = nLoc[0];
		var nc = nLoc[1];
		
		// check if neighbor location is valid/exists
		if (nr >= 0 && nr < nrows && nc >= 0 && nc < ncols) {
			// location exists; check the neighbor's state
			var neighbor = cells[nr][nc];
			if (neighbor.state === 1) wallTotal++;
		}
		else {
			// location doesn't exist
			// this location is beyond the bounds of the grid, but since we want the edges to be (mostly) walls, add 1 to the wall total (as this contributes to the "majority" vote rule, making it more likely that this cell will be a wall)
			wallTotal++;
		}
		
	}
	return wallTotal;
}
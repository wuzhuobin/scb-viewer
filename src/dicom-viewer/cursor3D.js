var math = require("mathjs")

class Cursor3D{
	constructor(){
		this.sizeX = 512;
		this.sizeY = 512;
		this.sizeZ = 512;

		// this.spacingX = 0.546;
		// this.spacingY = 0.546;
		// this.spacingZ = 0.546;

		this.offsetAxialX = 0.;
		this.offsetAxialY = 0.;
		this.offsetSagittalX = 0.;
		this.offsetSagittalY = 0.;
		this.offsetCoronalX = 0.;
		this.offsetCoronalY = 0.;
		// this.scaleX = 1; // 1 pixel = 1mm by default
		// this.scaleY = 1;
		// this.scaleZ = 1;
		this.ijkPositionX = 256;
		this.ijkPositionY = 256;
		this.ijkPositionZ = 256;
		this.viewportAxialSizeX = 256.;
		this.viewportAxialSizeY = 256.;
		this.viewportSagittalSizeX = 256.;
		this.viewportSagittalSizeY = 256.;
		this.viewportCoronalSizeX = 256.;
		this.viewportCoronalSizeY = 256.;
		this.viewportAxialToIjkMatrix = math.matrix([
			[1,0,1],
			[0,1,1],
			[0,0,1],
			])
		this.viewportSagittalToIjkMatrix = math.matrix([
			[1,0,1],
			[0,1,1],
			[0,0,1],
			])
		this.viewportCoronalToIjkMatrix = math.matrix([
			[1,0,1],
			[0,1,1],
			[0,0,1],
			])


		// this.worldToAxialViewportMatrix = math.matrix([
		// 	[1/this.viewportAxialSizeX,0.,this.offsetAxialX],
		// 	[0.,1/this.viewportAxialSizeY,this.offsetAxialY],
		// 	[0.,0.,1.]
		// 	])
		// this.worldToSagittalViewportMatrix = math.matrix([
		// 	[1./this.viewportSagittalSizeX,0.,this.offsetSagittalX],
		// 	[0.,1./this.viewportSagittalSizeY,this.offsetSagittalY],
		// 	[0.,0.,1.]
		// 	])
		// this.worldToCoronalViewportMatrix = math.matrix([
		// 	[1./this.viewportCoronalSizeX,0.,this.offsetCoronalX],
		// 	[0.,1./this.viewportCoronalSizeY,this.offsetCoronalY],
		// 	[0.,0.,1.]
		// 	])
	}

	setSize(x,y,z){
		this.sizeX = x;
		this.sizeY = y;
		this.sizeZ = z;
	}

	setViewportAxialSize(x,y){
		this.viewportAxialSizeX = x;
      	this.viewportAxialSizeY = y;
	}

	setViewportSagittalSize(x,y){
		this.viewportSagittalSizeX = x;
      	this.viewportSagittalSizeY = y;
	}

	setViewportCoronalSize(x,y){
		this.viewportCoronalSizeX = x;
      	this.viewportCoronalSizeY = y;
	}

	update(){
		// determine viewport ratio
		var viewportRatioAxial = this.viewportAxialSizeX/this.viewportAxialSizeY
		var sizeRatioAxial = this.sizeX/this.sizeY;
		var viewportRatioSagittal = this.viewportSagittalSizeX/this.viewportSagittalSizeY
		var sizeRatioSagittal = this.sizeY/this.sizeZ;
		var viewportRatioCoronal = this.viewportCoronalSizeX/this.viewportCoronalSizeY
		var sizeRatioCoronal = this.sizeX/this.sizeZ;

		console.log("size ratio",sizeRatioSagittal,sizeRatioCoronal)

		// determine offset in viewport coordinate
		if (sizeRatioAxial >= viewportRatioAxial){
			this.offsetAxialX = 0;
			this.offsetAxialY = (this.viewportAxialSizeY-this.viewportAxialSizeX*this.sizeY/this.sizeX)/2
		}
		else{
			this.offsetAxialX = (this.viewportAxialSizeX-this.viewportAxialSizeY*this.sizeX/this.sizeY)/2
			this.offsetAxialY = 0;
		}

		if (sizeRatioSagittal >= viewportRatioSagittal){
			this.offsetSagittalX = 0;
			this.offsetSagittalY = (this.viewportSagittalSizeY-this.viewportSagittalSizeX*this.sizeZ/this.sizeY)/2
			console.log("SAGG:",this.viewportSagittalSizeY, this.viewportSagittalSizeX, this.sizeZ,this.sizeY)
			console.log(this.offsetSagittalY)
		}
		else{
			this.offsetSagittalX = (this.viewportSagittalSizeX-this.viewportSagittalSizeY*this.sizeY/this.sizeZ)/2
			this.offsetSagittalY = 0;
		}

		if (sizeRatioCoronal >= viewportRatioCoronal){
			this.offsetCoronalX = 0;
			this.offsetCoronalY = (this.viewportCoronalSizeY-this.viewportCoronalSizeX*this.sizeZ/this.sizeX)/2
			console.log("CORO:",this.viewportCoronalSizeY, this.viewportCoronalSizeX, this.sizeZ,this.sizeX)
			console.log(this.offsetCoronalY)
		}
		else{
			this.offsetCoronalX = (this.viewportCoronalSizeX-this.viewportCoronalSizeY*this.sizeX/this.sizeZ)/2
			this.offsetCoronalY = 0;
		}

		// recompute viewport to ijk matrices
		var dummyAxialX = Math.min(this.viewportAxialSizeX, this.viewportAxialSizeY*this.sizeX/this.sizeY)
		var dummyAxialY = Math.min(this.viewportAxialSizeY, this.viewportAxialSizeX*this.sizeY/this.sizeX)

		this.viewportAxialToIjkMatrix = math.matrix([
			[this.sizeX*this.viewportAxialSizeX/dummyAxialX, 0, -this.offsetAxialX*this.sizeX/dummyAxialX],
			[0, this.sizeY*this.viewportAxialSizeY/dummyAxialY, -this.offsetAxialY*this.sizeY/dummyAxialY],
			[0, 0, 1],
			])

		var dummySagittalX = Math.min(this.viewportSagittalSizeX, this.viewportSagittalSizeY*this.sizeY/this.sizeZ)
		var dummySagittalY = Math.min(this.viewportSagittalSizeY, this.viewportSagittalSizeX*this.sizeZ/this.sizeY)

		this.viewportSagittalToIjkMatrix = math.matrix([
			[this.sizeY*this.viewportSagittalSizeX/dummySagittalX, 0, -this.offsetSagittalX*this.sizeY/dummySagittalX],
			[0, this.sizeZ*this.viewportSagittalSizeY/dummySagittalY, -this.offsetSagittalY*this.sizeZ/dummySagittalY],
			[0, 0, 1],
			])

		var dummyCoronalX = Math.min(this.viewportCoronalSizeX, this.viewportCoronalSizeY*this.sizeX/this.sizeZ)
		var dummyCoronalY = Math.min(this.viewportCoronalSizeY, this.viewportCoronalSizeX*this.sizeZ/this.sizeX)

		this.viewportCoronalToIjkMatrix = math.matrix([
			[this.sizeX*this.viewportCoronalSizeX/dummyCoronalX, 0, -this.offsetCoronalX*this.sizeX/dummyCoronalX],
			[0, this.sizeZ*this.viewportCoronalSizeY/dummyCoronalY, -this.offsetCoronalY*this.sizeZ/dummyCoronalY],
			[0, 0, 1],
			])

		// // recompute the matricies
		// this.worldToAxialViewportMatrix = math.matrix([
		// 	[1/this.viewportAxialSizeX,0.,this.offsetAxialX],
		// 	[0.,1/this.viewportAxialSizeY,this.offsetAxialY],
		// 	[0.,0.,1.]
		// 	])
		// this.worldToSagittalViewportMatrix = math.matrix([
		// 	[1./this.viewportSagittalSizeX,0.,this.offsetSagittalX],
		// 	[0.,1./this.viewportSagittalSizeY,this.offsetSagittalY],
		// 	[0.,0.,1.]
		// 	])
		// this.worldToCoronalViewportMatrix = math.matrix([
		// 	[1./this.viewportCoronalSizeX,0.,this.offsetCoronalX],
		// 	[0.,1./this.viewportCoronalSizeY,this.offsetCoronalY],
		// 	[0.,0.,1.]
		// 	])
	}

	setIjkPosition(x,y,z){
		console.log(x,y,z)

		this.ijkPositionX = x;
		this.ijkPositionY = y;
		this.ijkPositionZ = z;
	}

	getIjkPosition(){
		return [this.ijkPositionX, this.ijkPositionY, this.ijkPositionZ]
	}

	getAxialViewportPosition(){
		var matrixInv = math.inv(this.viewportAxialToIjkMatrix)
		var vpPos = math.multiply(matrixInv,math.matrix([this.ijkPositionX, this.ijkPositionY, 1]))
		return [math.subset(vpPos, math.index(0)),math.subset(vpPos, math.index(1))]
	}

	getSagittalViewportPosition(){
		var matrixInv = math.inv(this.viewportSagittalToIjkMatrix)
		var vpPos = math.multiply(matrixInv,math.matrix([this.ijkPositionY, this.ijkPositionZ, 1]))
		return [math.subset(vpPos, math.index(0)),math.subset(vpPos, math.index(1))]
	}

	getCoronalViewportPosition(){
		var matrixInv = math.inv(this.viewportCoronalToIjkMatrix)
		var vpPos = math.multiply(matrixInv,math.matrix([this.ijkPositionX, this.ijkPositionZ, 1]))
		return [math.subset(vpPos, math.index(0)),math.subset(vpPos, math.index(1))]
	}

	getIjkPositionFromAxial(x,y){
		var pos = math.multiply(this.viewportAxialToIjkMatrix, math.matrix([x, y, 1]))

		this.ijkPositionX = math.subset(pos, math.index(0))
		this.ijkPositionY = math.subset(pos, math.index(1))

		return [this.ijkPositionX, this.ijkPositionY, this.ijkPositionZ]
	}

	getIjkPositionFromSagittal(x,y){
		var pos = math.multiply(this.viewportSagittalToIjkMatrix, math.matrix([x, y, 1]))

		this.ijkPositionY = math.subset(pos, math.index(0))
		this.ijkPositionZ = math.subset(pos, math.index(1))

		return [this.ijkPositionX, this.ijkPositionY, this.ijkPositionZ]
	}

	getIjkPositionFromCoronal(x,y){
		var pos = math.multiply(this.viewportCoronalToIjkMatrix, math.matrix([x, y, 1]))

		this.ijkPositionX = math.subset(pos, math.index(0))
		this.ijkPositionZ = math.subset(pos, math.index(1))

		return [this.ijkPositionX, this.ijkPositionY, this.ijkPositionZ]
	}
}

export default Cursor3D

// cursor3D = new Cursor3D();
// cursor3D.setCursorPosition(128,0,0)
// pos = cursor3D.getAxialViewportPosition()
// console.log(pos)

// pos = cursor3D.getSagittalViewportPosition()
// console.log(pos)

// pos = cursor3D.getCoronalViewportPosition()
// console.log(pos)
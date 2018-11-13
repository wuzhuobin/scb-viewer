var math = require("mathjs")

class Cursor3D{
	constructor(){
		this.offsetAxialX = 0;
		this.offsetAxialY = 0;
		this.offsetSagittalX = 0;
		this.offsetSagittalY = 0;
		this.offsetCoronalX = 0;
		this.offsetCoronalY = 0;
		// this.scaleX = 1; // 1 pixel = 1mm by default
		// this.scaleY = 1;
		// this.scaleZ = 1;
		this.worldPositionX = 0;
		this.worldPositionY = 0;
		this.worldPositionZ = 0;
		this.viewportAxialSizeX = 256;
		this.viewportAxialSizeY = 256;
		this.viewportSagittalSizeX = 256;
		this.viewportSagittalSizeY = 256;
		this.viewportCoronalSizeX = 256;
		this.viewportCoronalSizeY = 256;
		this.worldToAxialViewportMatrix = math.matrix([
			[1/this.viewportAxialSizeX,0,this.offsetAxialX],
			[0,1/this.viewportAxialSizeY,this.offsetAxialY],
			[0,0,1]
			])
		this.worldToSagittalViewportMatrix = math.matrix([
			[1/this.viewportSagittalSizeX,0,this.offsetSagittalX],
			[0,1/this.viewportSagittalSizeY,this.offsetSagittalY],
			[0,0,1]
			])
		this.worldToCoronalViewportMatrix = math.matrix([
			[1/this.viewportCoronalSizeX,0,this.offsetCoronalX],
			[0,1/this.viewportCoronalSizeY,this.offsetCoronalY],
			[0,0,1]
			])
	}

	setCursorPosition(x,y,z){
		this.worldPositionX = x;
		this.worldPositionY = y;
		this.worldPositionZ = z;
	}

	getAxialViewportPosition(){
		var vpPos = math.multiply(this.worldToAxialViewportMatrix,math.matrix([this.worldPositionX, this.worldPositionY, 1]))
		return [math.subset(vpPos, math.index(0)),math.subset(vpPos, math.index(1))]
	}

	getSagittalViewportPosition(){
		return 
	}

	getCoronalViewportPosition(){
		return 
	}
}

cursor3D = new Cursor3D();
cursor3D.setCursorPosition(128,128,128)
pos = cursor3D.getAxialViewportPosition()

console.log(pos)
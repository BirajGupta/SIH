var		express=require("express"); 
		mongoose=require("mongoose");



userschema= new mongoose.Schema({
	appno:String,
	name:String,
	docname:String,
	created:{type:Date, default:Date.now},
	nextapp:Number,
	phone:Number
});

module.exports=mongoose.model("database",userschema);
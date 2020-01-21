var mongoose=require("mongoose");
	passportlocalmongoose=require("passport-local-mongoose");

userschema= new mongoose.Schema({
	username:String,
	password:String
})

userschema.plugin(passportlocalmongoose);

module.exports=mongoose.model("user",userschema);
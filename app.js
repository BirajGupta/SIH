var express=require("express");
	bodyParser=require("body-parser");
	passport=require("passport");
	passportstrategy=require("passport-local");
	user=require("./models/users.js");
	mongoose=require("mongoose");
	app=express();
	Database=require("./models/database");
	metover=require("method-override");


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/hospdb");


app.use(require("express-session")({
	secret:"HOSP",
	resave:false,
	saveUninitialized:false
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportstrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(metover("_method"));

app.get("/admin",function(req,res){
	res.render("landing");
})


app.get("/admin/database",isloggedin,function(req,res){
	Database.find({},function(err,allpatients){
		if(err){
			console.log(err);
		}
		res.render("database",{patients:allpatients});
	})
})

app.post("/admin",function(req,res){
	        passport.authenticate("local")(req,res,function(){
			res.redirect("/admin/database");
	});
});


app.put("/admin/database/:id/done",function(req,res){    
	var timestamp=req.query.patient.date.valueOf();
	
	var timestamp=timestamp+86400000;
	var date=new Date(timestamp);
	req.query.patient.date=date;                                                     //date update by submit
	Database.findByIdAndUpdate(req.params.id,req.query.patient,function(err,updated){
		if(err){
			console.log(err);
		}
		res.redirect("/admin/database");
		console.log(req.query.patient);
	})
})

app.get("/admin/database/:id/edit",function(req,res){
	Database.findById(req.params.id,function(err,found){
		if(err){
			console.log(err)
		}
		res.render("edit",{patient:found});
	})
})


app.put("/admin/database/:id",function(req,res){                                                      //whole entry update with a form
	Database.findByIdAndUpdate(req.params.id,req.body.patient,function(err,updated){
		if(err){
			console.log(err)
		}
		res.redirect("/admin/database");
	})
})

app.delete("/admin/database/:id",function(req,res){
	Database.findByIdAndRemove(req.params.id,function(err,removed){
		if(err){
			console.log(err);
		}
		res.redirect("/admin/database");
	})
})



app.get("/admin/database/new",function(req,res){
	res.render("new");
})

app.post("/admin/database",function(req,res){
	var newpatient=req.body.data;
	Database.create(newpatient,function(err,newlycreated){
		if(err){
			console.log(err);
		}
		res.redirect("/admin/database");
	})
})


function isloggedin(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/admin");
}


app.listen("3000",function(){
	console.log("site is working");
})



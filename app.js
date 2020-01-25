var express=require("express");
	bodyParser=require("body-parser");
	passport=require("passport");
	passportstrategy=require("passport-local");
	user=require("./models/users.js");
	mongoose=require("mongoose");
	app=express();
	Database=require("./models/database");
	metover=require("method-override");
   	const accountSid = 'AC0a408eaa5fdaed5c7f0468f8fdebb3e2';
	const authToken = '122c042907598dfd4ae7fb74f44c9f5a';
	client = require('twilio')(accountSid, authToken);


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
app.use(express.static("public"));

const message = "You're scheduled for a dentist appointment at 2:30PM.";
const messageType = "ARN";

console.log("## MessagingClient.message ##");


app.get("/",function(req,res){
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

app.post("/",function(req,res){
	        passport.authenticate("local")(req,res,function(){
			res.redirect("/admin/database");
	});
});


app.put("/admin/database/:id/done",function(req,res){  
     
	Database.findById(req.params.id,function(err,updated){
		if(err){
			console.log(err);
		}
		updated.created = new Date(updated.created.valueOf() + updated.nextapp*24*3600000);
		updated.save(function(err, updated){
			res.redirect("/admin/database");
		})
	})
})

app.put("/admin/database/:id/message",function(req,res){
	
	Database.findById(req.params.id,function(err,found){
		if(err){
			console.log(err);
		}
	
		client.messages
		.create({
	   	body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
  		 from: '+12016902087',
   		to: found.phone
		 })
.then(message => console.log(message.sid));
		});
	  
  });


app.get("/admin/database/:id/edit",function(req,res){
	Database.findById(req.params.id,function(err,found){
		if(err){
			console.log(err)
		}
		res.render("edit",{patient:found});
	})
});

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
	res.redirect("/");
}



app.listen("3000",function(){
	console.log("site is working");
})


